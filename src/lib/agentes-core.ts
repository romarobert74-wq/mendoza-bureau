// ─────────────────────────────────────────────────────────────
//  Núcleo de los agentes: lógica reutilizable por las rutas
//  individuales y por el orquestador de campaña completa.
// ─────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk'
import { getRubroMeta, type Rubro, type Comercio } from '@/types/agentes'
import { leerFuentes } from '@/lib/fuentes'
import { publicarCampania, type CampaignSpec, type MetaCred } from '@/lib/meta'
import { generarCreativo, type CanvaCred } from '@/lib/canva'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface BaseCtx {
  rubro: Rubro
  pais: string
  departamento: string
  comercio: Comercio
}

export interface ImagenRef { mediaType: string; data: string }

function reglasRubro(rubro: Rubro): string {
  const r = getRubroMeta(rubro)
  if (r.categoriaEspecial === 'HOUSING') {
    return '⚠️ CATEGORÍA ESPECIAL (VIVIENDA): segmentación por edad/género/radio RESTRINGIDA. Declarar categoría "Vivienda", intereses amplios, ubicación ≥ 15 millas.'
  }
  if (rubro === 'salud') {
    return '⚠️ SALUD: sin diagnósticos, sin promesas de cura, sin "antes/después" engañosos, sin segmentar por condiciones de salud. Enfoque en bienestar.'
  }
  return 'Rubro sin categoría especial: segmentación por intereses y comportamiento permitida.'
}

// ── 1. ESTRATEGA ───────────────────────────────────────────
export interface EstrategaInput extends BaseCtx {
  idea: string
  contextoExtra?: string
  urlsCompetencia?: string[]
  imagenes?: ImagenRef[]
  modelo?: string
}

export async function correrEstratega(b: EstrategaInput): Promise<string> {
  const r = getRubroMeta(b.rubro)
  const system = `Eres "Agente Estratega", estratega senior de Meta Ads con 10+ años en performance. Transformá la IDEA en una ESTRATEGIA COMPLETA lista para ejecutar.

COMERCIO: ${b.comercio.nombre || 'N/D'} · Rubro: ${r.nombre} · Ubicación: ${b.departamento}, ${b.pais}
Ofrece: ${b.comercio.descripcion || 'N/D'} · Oferta: ${b.comercio.oferta || 'N/D'} · Web: ${b.comercio.sitioWeb || 'N/D'} · WhatsApp: ${b.comercio.whatsapp || 'N/D'}

REGLAS META: ${reglasRubro(b.rubro)}

Si hay fuentes (URLs de competencia, redes, imágenes), analizalas primero.

DEVOLVÉ EN MARKDOWN:
## 0. Análisis de fuentes (solo si hay fuentes)
## 1. Estrategia (objetivo Meta recomendado y por qué; embudo)
## 2. Estructura de campaña (nombre, ad sets, segmentación geo ${b.departamento})
## 3. Creativos (brief: 3 variantes con copy, titular ≤40, descripción, CTA, idea visual 1:1 y 9:16)
## 4. Presupuesto y proyección (estimaciones, no garantías)
## 5. Medición y optimización (KPIs, umbrales, A/B)
## Pasos para cargar en Meta (enumerados)

Español rioplatense, concreto, sin relleno.`

  const texto = [
    `Idea de la pauta:\n\n${b.idea}`,
    b.contextoExtra?.trim() ? `\n\nContexto adicional:\n${b.contextoExtra.trim()}` : '',
    b.urlsCompetencia?.length ? `\n\n─── FUENTES ───\n${await leerFuentes(b.urlsCompetencia)}` : '',
  ].join('')

  const bloques: Anthropic.ContentBlockParam[] = [{ type: 'text', text: texto }]
  for (const img of (b.imagenes ?? []).slice(0, 5)) {
    bloques.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: img.data },
    })
  }

  const res = await client.messages.create({
    model: b.modelo ?? 'claude-opus-4-8',
    max_tokens: 3500,
    system,
    messages: [{ role: 'user', content: bloques }],
  })
  return res.content[0]?.type === 'text' ? res.content[0].text : ''
}

// ── 2. CREATIVO ────────────────────────────────────────────
export interface Variante { textoPrincipal: string; titulo: string; descripcion: string; cta: string; promptImagen: string; briefVisual: string }
export interface PaqueteCreativo { variantes: Variante[]; carrusel: { titulo: string; texto: string }[]; guionVideo: string }
export interface CreativoResultado { paquete: PaqueteCreativo; simulacion: boolean; canva?: { designId: string; editUrl?: string; imagenUrl?: string }; canvaError?: string }

export interface CreativoInput extends BaseCtx {
  idea: string
  brief?: string
  credenciales: Record<string, string>
}

const CREATIVOS_TOOL: Anthropic.Tool = {
  name: 'definir_creativos',
  description: 'Genera el paquete creativo completo para una campaña de Meta Ads.',
  input_schema: {
    type: 'object',
    properties: {
      variantes: {
        type: 'array', description: '3 variantes de anuncio de imagen única',
        items: {
          type: 'object',
          properties: {
            textoPrincipal: { type: 'string' }, titulo: { type: 'string', description: 'máx 40 caracteres' },
            descripcion: { type: 'string' }, cta: { type: 'string' },
            promptImagen: { type: 'string', description: 'Prompt detallado para generar la imagen (1:1)' },
            briefVisual: { type: 'string' },
          },
          required: ['textoPrincipal', 'titulo', 'descripcion', 'cta', 'promptImagen', 'briefVisual'],
        },
      },
      carrusel: {
        type: 'array', description: '3 a 5 slides',
        items: { type: 'object', properties: { titulo: { type: 'string' }, texto: { type: 'string' } }, required: ['titulo', 'texto'] },
      },
      guionVideo: { type: 'string', description: 'Guion de reel 9:16 de 15-20s' },
    },
    required: ['variantes', 'carrusel', 'guionVideo'],
  },
}

export async function correrCreativo(b: CreativoInput): Promise<CreativoResultado> {
  const r = getRubroMeta(b.rubro)
  const system = `Sos director creativo de una agencia de Meta Ads. Generá creativos para ${b.comercio.nombre} (${r.nombre}) en ${b.departamento}, ${b.pais}.
Comercio: ${b.comercio.descripcion || 'N/D'} · Oferta: ${b.comercio.oferta || 'N/D'}
${reglasRubro(b.rubro)}
${b.brief ? `\nESTRATEGIA BASE:\n${b.brief}\n` : ''}
Copies en español rioplatense, potentes. Prompts de imagen detallados. Llamá a definir_creativos.`

  const msg = await client.messages.create({
    model: 'claude-opus-4-8', max_tokens: 2500, system,
    tools: [CREATIVOS_TOOL], tool_choice: { type: 'tool', name: 'definir_creativos' },
    messages: [{ role: 'user', content: `Idea de la pauta:\n${b.idea}` }],
  })
  const toolUse = msg.content.find(c => c.type === 'tool_use') as Anthropic.ToolUseBlock | undefined
  if (!toolUse) throw new Error('No se pudieron generar los creativos')
  const paquete = toolUse.input as PaqueteCreativo

  const token = b.credenciales?.canva_access_token
  const brandTemplateId = b.credenciales?.canva_brand_template_id
  if (!token || !brandTemplateId) return { paquete, simulacion: true }

  try {
    const cred: CanvaCred = { token, brandTemplateId }
    const v0 = paquete.variantes[0]
    const canva = await generarCreativo(cred, {
      titulo: v0.titulo, subtitulo: b.comercio.oferta || '', cuerpo: v0.descripcion, marca: b.comercio.nombre,
    })
    return { paquete, simulacion: false, canva }
  } catch (err) {
    return { paquete, simulacion: false, canvaError: (err as Error).message }
  }
}

// ── 3. PUBLICADOR ──────────────────────────────────────────
export interface PublicadorResultado {
  spec: CampaignSpec
  simulacion: boolean
  resultado?: Awaited<ReturnType<typeof publicarCampania>>
}

export interface PublicadorInput extends BaseCtx {
  idea: string
  brief?: string
  imagenUrl?: string
  credenciales: Record<string, string>
}

const SPEC_TOOL: Anthropic.Tool = {
  name: 'definir_campania',
  description: 'Define la estructura completa de una campaña de Meta Ads lista para crear vía API.',
  input_schema: {
    type: 'object',
    properties: {
      nombreCampania: { type: 'string' },
      objetivo: { type: 'string', enum: ['OUTCOME_TRAFFIC', 'OUTCOME_AWARENESS', 'OUTCOME_ENGAGEMENT'] },
      presupuestoDiarioArs: { type: 'number' },
      targeting: {
        type: 'object',
        properties: {
          ciudad: { type: 'string' }, radioKm: { type: 'number' }, edadMin: { type: 'number' }, edadMax: { type: 'number' },
          generos: { type: 'array', items: { type: 'number' } }, intereses: { type: 'array', items: { type: 'string' } },
        },
        required: ['ciudad', 'radioKm', 'edadMin', 'edadMax', 'generos', 'intereses'],
      },
      creativo: {
        type: 'object',
        properties: {
          textoPrincipal: { type: 'string' }, titulo: { type: 'string' }, descripcion: { type: 'string' },
          cta: { type: 'string', enum: ['LEARN_MORE', 'WHATSAPP_MESSAGE', 'MESSAGE_PAGE', 'CALL_NOW', 'SIGN_UP', 'CONTACT_US', 'SHOP_NOW'] },
          enlace: { type: 'string' },
        },
        required: ['textoPrincipal', 'titulo', 'descripcion', 'cta', 'enlace'],
      },
    },
    required: ['nombreCampania', 'objetivo', 'presupuestoDiarioArs', 'targeting', 'creativo'],
  },
}

export async function correrPublicador(b: PublicadorInput): Promise<PublicadorResultado> {
  const r = getRubroMeta(b.rubro)
  const esVivienda = r.categoriaEspecial === 'HOUSING'
  const system = `Sos experto en Meta Ads. Convertí la idea en una campaña para ${b.comercio.nombre} (${r.nombre}) en ${b.departamento}, ${b.pais}.
Comercio: ${b.comercio.descripcion || 'N/D'} · Oferta: ${b.comercio.oferta || 'N/D'} · Web: ${b.comercio.sitioWeb || 'N/D'} · WhatsApp: ${b.comercio.whatsapp || 'N/D'}
${reglasRubro(b.rubro)}
El enlace del creativo usa el sitio web; si no hay, un link https://wa.me/<numero>. Ciudad de targeting: ${b.departamento}.${b.brief ? `\n\nESTRATEGIA BASE:\n${b.brief}` : ''}
Llamá a definir_campania con valores realistas.`

  const msg = await client.messages.create({
    model: 'claude-opus-4-8', max_tokens: 1500, system,
    tools: [SPEC_TOOL], tool_choice: { type: 'tool', name: 'definir_campania' },
    messages: [{ role: 'user', content: `Idea de la pauta:\n${b.idea}` }],
  })
  const toolUse = msg.content.find(c => c.type === 'tool_use') as Anthropic.ToolUseBlock | undefined
  if (!toolUse) throw new Error('No se pudo generar la campaña')

  const input = toolUse.input as Omit<CampaignSpec, 'esVivienda'>
  const spec: CampaignSpec = { ...input, esVivienda, creativo: { ...input.creativo, imagenUrl: b.imagenUrl || undefined } }

  const token = b.credenciales?.meta_access_token
  const adAccountId = b.credenciales?.meta_ad_account_id
  const pageId = b.credenciales?.fb_page_id
  if (!token || !adAccountId) return { spec, simulacion: true }

  const cred: MetaCred = { token, adAccountId, pageId }
  const resultado = await publicarCampania(cred, spec)
  return { spec, simulacion: false, resultado }
}
