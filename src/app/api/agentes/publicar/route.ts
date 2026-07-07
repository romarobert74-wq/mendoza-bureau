import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRubroMeta, type Rubro, type Comercio } from '@/types/agentes'
import { publicarCampania, type CampaignSpec, type MetaCred } from '@/lib/meta'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Body {
  idea: string
  rubro: Rubro
  pais: string
  departamento: string
  comercio: Comercio
  imagenUrl?: string
  brief?: string   // estrategia recibida del Agente Estratega (encadenado)
  credenciales: Record<string, string>
}

// Herramienta de salida estructurada para el spec de campaña
const SPEC_TOOL: Anthropic.Tool = {
  name: 'definir_campania',
  description: 'Define la estructura completa de una campaña de Meta Ads lista para crear vía API.',
  input_schema: {
    type: 'object',
    properties: {
      nombreCampania: { type: 'string', description: 'Nomenclatura: [Comercio]_[Rubro]_[Objetivo]_[Mes]' },
      objetivo: {
        type: 'string',
        enum: ['OUTCOME_TRAFFIC', 'OUTCOME_AWARENESS', 'OUTCOME_ENGAGEMENT'],
        description: 'Objetivo seguro para crear como borrador sin pixel ni formulario. Elegí TRAFFIC para leads a web/WhatsApp, ENGAGEMENT para interacción, AWARENESS para alcance.',
      },
      presupuestoDiarioArs: { type: 'number', description: 'Presupuesto diario en pesos argentinos (número, ej: 5000).' },
      targeting: {
        type: 'object',
        properties: {
          ciudad: { type: 'string' },
          radioKm: { type: 'number' },
          edadMin: { type: 'number' },
          edadMax: { type: 'number' },
          generos: { type: 'array', items: { type: 'number' }, description: '[] todos, [1] hombres, [2] mujeres' },
          intereses: { type: 'array', items: { type: 'string' }, description: 'Intereses reales de Meta en español, ej: "Bienes raíces"' },
        },
        required: ['ciudad', 'radioKm', 'edadMin', 'edadMax', 'generos', 'intereses'],
      },
      creativo: {
        type: 'object',
        properties: {
          textoPrincipal: { type: 'string' },
          titulo: { type: 'string', description: 'Máx 40 caracteres' },
          descripcion: { type: 'string' },
          cta: { type: 'string', enum: ['LEARN_MORE', 'WHATSAPP_MESSAGE', 'MESSAGE_PAGE', 'CALL_NOW', 'SIGN_UP', 'CONTACT_US', 'SHOP_NOW'] },
          enlace: { type: 'string', description: 'URL de destino (sitio web o https://wa.me/...)' },
        },
        required: ['textoPrincipal', 'titulo', 'descripcion', 'cta', 'enlace'],
      },
    },
    required: ['nombreCampania', 'objetivo', 'presupuestoDiarioArs', 'targeting', 'creativo'],
  },
}

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Body
    if (!b.idea?.trim()) {
      return NextResponse.json({ error: 'Falta la idea de la pauta' }, { status: 400 })
    }

    const r = getRubroMeta(b.rubro)
    const esVivienda = r.categoriaEspecial === 'HOUSING'

    const reglas = esVivienda
      ? 'RUBRO VIVIENDA (Categoría Especial): NO restrinjas por género (generos=[]), edad 18-65, radio ≥ 25km. Intereses amplios permitidos.'
      : b.rubro === 'salud'
        ? 'RUBRO SALUD: copy sin promesas de cura ni diagnósticos; enfoque en bienestar. No segmentar por condiciones de salud.'
        : 'Segmentación por intereses y comportamiento permitida.'

    const system = `Sos un experto en Meta Ads. Convertí la idea del usuario en una campaña concreta para ${b.comercio.nombre} (${r.nombre}) en ${b.departamento}, ${b.pais}.
Comercio: ${b.comercio.descripcion || 'N/D'}. Oferta: ${b.comercio.oferta || 'N/D'}. Web: ${b.comercio.sitioWeb || 'N/D'}. WhatsApp: ${b.comercio.whatsapp || 'N/D'}.
${reglas}
El enlace del creativo debe usar el sitio web si existe; si no, un link de WhatsApp (https://wa.me/<numero>) si hay WhatsApp. La ciudad de targeting debe ser ${b.departamento}.${b.brief ? `\n\nESTRATEGIA DEL AGENTE ESTRATEGA (basá la campaña en esto):\n${b.brief}` : ''}\nLlamá a la herramienta definir_campania con valores realistas.`

    const msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1500,
      system,
      tools: [SPEC_TOOL],
      tool_choice: { type: 'tool', name: 'definir_campania' },
      messages: [{ role: 'user', content: `Idea de la pauta:\n${b.idea}` }],
    })

    const toolUse = msg.content.find(c => c.type === 'tool_use') as Anthropic.ToolUseBlock | undefined
    if (!toolUse) {
      return NextResponse.json({ error: 'No se pudo generar la campaña' }, { status: 500 })
    }

    const input = toolUse.input as Omit<CampaignSpec, 'esVivienda'>
    const spec: CampaignSpec = {
      ...input,
      esVivienda,
      creativo: { ...input.creativo, imagenUrl: b.imagenUrl || undefined },
    }

    // ¿Hay credenciales para publicar de verdad?
    const token = b.credenciales?.meta_access_token
    const adAccountId = b.credenciales?.meta_ad_account_id
    const pageId = b.credenciales?.fb_page_id

    if (!token || !adAccountId) {
      return NextResponse.json({ spec, simulacion: true })
    }

    const cred: MetaCred = { token, adAccountId, pageId }
    const resultado = await publicarCampania(cred, spec)
    return NextResponse.json({ spec, simulacion: false, resultado })
  } catch (err) {
    console.error('[agentes/publicar]', err)
    return NextResponse.json({ error: (err as Error).message || 'Error interno' }, { status: 500 })
  }
}
