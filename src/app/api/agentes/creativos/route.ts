import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRubroMeta, type Rubro, type Comercio } from '@/types/agentes'
import { generarCreativo, type CanvaCred } from '@/lib/canva'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Body {
  idea: string
  rubro: Rubro
  pais: string
  departamento: string
  comercio: Comercio
  credenciales: Record<string, string>
}

const CREATIVOS_TOOL: Anthropic.Tool = {
  name: 'definir_creativos',
  description: 'Genera el paquete creativo completo para una campaña de Meta Ads.',
  input_schema: {
    type: 'object',
    properties: {
      variantes: {
        type: 'array',
        description: '3 variantes de anuncio de imagen única',
        items: {
          type: 'object',
          properties: {
            textoPrincipal: { type: 'string', description: 'Copy principal con hook, beneficio, prueba y CTA' },
            titulo: { type: 'string', description: 'Titular, máx 40 caracteres' },
            descripcion: { type: 'string' },
            cta: { type: 'string' },
            promptImagen: { type: 'string', description: 'Prompt detallado para generar la imagen (estilo, escena, colores, texto en pantalla), formato 1:1' },
            briefVisual: { type: 'string', description: 'Brief para un diseñador: qué mostrar, paleta, tipografía' },
          },
          required: ['textoPrincipal', 'titulo', 'descripcion', 'cta', 'promptImagen', 'briefVisual'],
        },
      },
      carrusel: {
        type: 'array',
        description: '3 a 5 slides para un anuncio de carrusel',
        items: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            texto: { type: 'string' },
          },
          required: ['titulo', 'texto'],
        },
      },
      guionVideo: { type: 'string', description: 'Guion breve de un reel/video vertical 9:16 de 15-20 segundos' },
    },
    required: ['variantes', 'carrusel', 'guionVideo'],
  },
}

interface CreativoInput {
  variantes: { textoPrincipal: string; titulo: string; descripcion: string; cta: string; promptImagen: string; briefVisual: string }[]
  carrusel: { titulo: string; texto: string }[]
  guionVideo: string
}

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Body
    if (!b.idea?.trim()) {
      return NextResponse.json({ error: 'Falta la idea de la pauta' }, { status: 400 })
    }

    const r = getRubroMeta(b.rubro)
    const reglas =
      r.categoriaEspecial === 'HOUSING'
        ? 'Rubro vivienda: mostrá la propiedad y el estilo de vida, sin discriminar por perfiles de personas.'
        : b.rubro === 'salud'
          ? 'Rubro salud: sin promesas de cura, sin "antes/después" engañosos; enfoque en bienestar y confianza.'
          : 'Enfoque directo a resultados y prueba social.'

    const system = `Sos director creativo de una agencia de Meta Ads. Generá creativos para ${b.comercio.nombre} (${r.nombre}) en ${b.departamento}, ${b.pais}.
Comercio: ${b.comercio.descripcion || 'N/D'}. Oferta: ${b.comercio.oferta || 'N/D'}.
${reglas}
Copies en español rioplatense, potentes y concretos. Prompts de imagen bien detallados y accionables. Llamá a la herramienta definir_creativos.`

    const msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2500,
      system,
      tools: [CREATIVOS_TOOL],
      tool_choice: { type: 'tool', name: 'definir_creativos' },
      messages: [{ role: 'user', content: `Idea de la pauta:\n${b.idea}` }],
    })

    const toolUse = msg.content.find(c => c.type === 'tool_use') as Anthropic.ToolUseBlock | undefined
    if (!toolUse) {
      return NextResponse.json({ error: 'No se pudieron generar los creativos' }, { status: 500 })
    }
    const paquete = toolUse.input as CreativoInput

    // ¿Generar imagen real con Canva?
    const token = b.credenciales?.canva_access_token
    const brandTemplateId = b.credenciales?.canva_brand_template_id

    if (!token || !brandTemplateId) {
      return NextResponse.json({ paquete, simulacion: true })
    }

    try {
      const cred: CanvaCred = { token, brandTemplateId }
      const v0 = paquete.variantes[0]
      // Campos genéricos de la plantilla de marca (ajustar a los nombres reales de tu template)
      const canva = await generarCreativo(cred, {
        titulo: v0.titulo,
        subtitulo: b.comercio.oferta || '',
        cuerpo: v0.descripcion,
        marca: b.comercio.nombre,
      })
      return NextResponse.json({ paquete, simulacion: false, canva })
    } catch (err) {
      return NextResponse.json({ paquete, simulacion: false, canvaError: (err as Error).message })
    }
  } catch (err) {
    console.error('[agentes/creativos]', err)
    return NextResponse.json({ error: (err as Error).message || 'Error interno' }, { status: 500 })
  }
}
