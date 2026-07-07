// ─────────────────────────────────────────────────────────────
//  Cliente de la Meta Marketing API (server-side)
//  Crea Campaign → Ad Set → (Creative → Ad) en estado PAUSED.
// ─────────────────────────────────────────────────────────────

const API = 'https://graph.facebook.com/v21.0'

export interface MetaCred {
  token: string
  adAccountId: string      // con o sin prefijo "act_"
  pageId?: string
}

export interface CampaignSpec {
  nombreCampania: string
  objetivo: 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS' | 'OUTCOME_ENGAGEMENT'
  presupuestoDiarioArs: number
  targeting: {
    ciudad: string          // "Mendoza"
    radioKm: number
    edadMin: number
    edadMax: number
    generos: number[]       // [] = todos, [1] hombres, [2] mujeres
    intereses: string[]     // nombres, se resuelven a IDs reales
  }
  creativo: {
    textoPrincipal: string
    titulo: string
    descripcion: string
    cta: string             // LEARN_MORE, WHATSAPP_MESSAGE, etc.
    enlace: string
    imagenUrl?: string
  }
  esVivienda: boolean       // Categoría Especial HOUSING
}

export interface ResultadoPublicacion {
  campaignId: string
  adSetId: string
  creativeId?: string
  adId?: string
  geoResuelto: string
  interesesResueltos: string[]
  advertencias: string[]
}

const OPT_GOAL: Record<CampaignSpec['objetivo'], string> = {
  OUTCOME_TRAFFIC: 'LINK_CLICKS',
  OUTCOME_AWARENESS: 'REACH',
  OUTCOME_ENGAGEMENT: 'POST_ENGAGEMENT',
}

function normalizarActId(id: string): string {
  return id.startsWith('act_') ? id : `act_${id}`
}

async function metaError(res: Response): Promise<never> {
  let msg = `Meta API ${res.status}`
  try {
    const body = await res.json()
    if (body?.error?.message) msg = `Meta: ${body.error.message}`
  } catch { /* ignore */ }
  throw new Error(msg)
}

async function metaGet(path: string, params: Record<string, string>, token: string) {
  const qs = new URLSearchParams({ ...params, access_token: token }).toString()
  const res = await fetch(`${API}${path}?${qs}`)
  if (!res.ok) await metaError(res)
  return res.json()
}

async function metaPost(path: string, body: Record<string, unknown>, token: string) {
  const form = new URLSearchParams()
  for (const [k, v] of Object.entries(body)) {
    form.append(k, typeof v === 'string' ? v : JSON.stringify(v))
  }
  form.append('access_token', token)
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) await metaError(res)
  return res.json()
}

// ── Resolver una ciudad a su "key" de Meta ─────────────────
export async function buscarCiudad(
  token: string,
  q: string,
): Promise<{ key: string; name: string } | null> {
  try {
    const data = await metaGet('/search', {
      type: 'adgeolocation',
      location_types: JSON.stringify(['city']),
      q,
      limit: '1',
    }, token)
    const c = data?.data?.[0]
    return c ? { key: c.key, name: `${c.name}, ${c.region ?? ''}`.trim() } : null
  } catch {
    return null
  }
}

// ── Resolver nombres de intereses a IDs reales ─────────────
export async function buscarIntereses(
  token: string,
  nombres: string[],
): Promise<{ id: string; name: string }[]> {
  const out: { id: string; name: string }[] = []
  for (const nombre of nombres.slice(0, 8)) {
    try {
      const data = await metaGet('/search', {
        type: 'adinterest',
        q: nombre,
        limit: '1',
      }, token)
      const i = data?.data?.[0]
      if (i?.id) out.push({ id: i.id, name: i.name })
    } catch { /* ignore */ }
  }
  return out
}

// ── Orquestación completa ──────────────────────────────────
export async function publicarCampania(
  cred: MetaCred,
  spec: CampaignSpec,
): Promise<ResultadoPublicacion> {
  const act = normalizarActId(cred.adAccountId)
  const advertencias: string[] = []

  // 1. Campaña
  const special = spec.esVivienda ? ['HOUSING'] : []
  const campaign = await metaPost(`/${act}/campaigns`, {
    name: spec.nombreCampania,
    objective: spec.objetivo,
    status: 'PAUSED',
    special_ad_categories: special,
  }, cred.token)

  // 2. Targeting real
  const ciudad = await buscarCiudad(cred.token, spec.targeting.ciudad)
  if (!ciudad) advertencias.push(`No se encontró la ciudad "${spec.targeting.ciudad}", se segmentó a nivel país (AR).`)

  const intereses = await buscarIntereses(cred.token, spec.targeting.intereses)
  if (spec.targeting.intereses.length && !intereses.length) {
    advertencias.push('No se pudieron resolver los intereses; se creó sin segmentación por intereses.')
  }

  // Reglas de Categoría Especial "Vivienda"
  let edadMin = spec.targeting.edadMin
  let edadMax = spec.targeting.edadMax
  let generos = spec.targeting.generos
  let radioMillas = Math.round(spec.targeting.radioKm * 0.621)
  if (spec.esVivienda) {
    edadMin = 18
    edadMax = 65
    generos = []
    if (radioMillas < 15) radioMillas = 15
    advertencias.push('Categoría Vivienda: se forzó edad 18-65, sin filtro de género y radio mínimo de 15 millas (obligatorio por Meta).')
  } else {
    radioMillas = Math.min(Math.max(radioMillas, 5), 50)
  }

  const geo = ciudad
    ? { cities: [{ key: ciudad.key, radius: radioMillas, distance_unit: 'mile' }] }
    : { countries: ['AR'] }

  const targeting: Record<string, unknown> = {
    geo_locations: geo,
    age_min: edadMin,
    age_max: edadMax,
    publisher_platforms: ['facebook', 'instagram'],
  }
  if (generos.length) targeting.genders = generos
  if (intereses.length) targeting.flexible_spec = [{ interests: intereses }]

  // 3. Ad Set
  const adSet = await metaPost(`/${act}/adsets`, {
    name: `${spec.nombreCampania} · Conjunto`,
    campaign_id: campaign.id,
    daily_budget: String(Math.round(spec.presupuestoDiarioArs * 100)), // centavos
    billing_event: 'IMPRESSIONS',
    optimization_goal: OPT_GOAL[spec.objetivo],
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting,
    status: 'PAUSED',
  }, cred.token)

  const result: ResultadoPublicacion = {
    campaignId: campaign.id,
    adSetId: adSet.id,
    geoResuelto: ciudad?.name ?? 'Argentina (país)',
    interesesResueltos: intereses.map(i => i.name),
    advertencias,
  }

  // 4. Creative + Ad (solo si hay página e imagen)
  if (cred.pageId && spec.creativo.imagenUrl) {
    try {
      const creative = await metaPost(`/${act}/adcreatives`, {
        name: `${spec.nombreCampania} · Creativo`,
        object_story_spec: {
          page_id: cred.pageId,
          link_data: {
            message: spec.creativo.textoPrincipal,
            link: spec.creativo.enlace,
            name: spec.creativo.titulo,
            description: spec.creativo.descripcion,
            picture: spec.creativo.imagenUrl,
            call_to_action: { type: spec.creativo.cta, value: { link: spec.creativo.enlace } },
          },
        },
      }, cred.token)
      result.creativeId = creative.id

      const ad = await metaPost(`/${act}/ads`, {
        name: `${spec.nombreCampania} · Anuncio`,
        adset_id: adSet.id,
        creative: { creative_id: creative.id },
        status: 'PAUSED',
      }, cred.token)
      result.adId = ad.id
    } catch (err) {
      advertencias.push(`Campaña y conjunto creados, pero el anuncio falló: ${(err as Error).message}. Podés cargar el creativo manualmente en Meta.`)
    }
  } else {
    advertencias.push('Se crearon Campaña + Conjunto de anuncios (borrador). Falta Página de Facebook o URL de imagen para crear el anuncio automáticamente; cargá el creativo en Meta con el copy generado.')
  }

  return result
}
