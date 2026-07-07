import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRubroMeta, type Rubro, type Comercio } from '@/types/agentes'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Body {
  idea: string
  rubro: Rubro
  pais: string
  departamento: string
  comercio: Comercio
  modelo?: string
}

function buildSystemPrompt(b: Body): string {
  const r = getRubroMeta(b.rubro)

  const reglaCategoria =
    r.categoriaEspecial === 'HOUSING'
      ? `⚠️ CATEGORÍA ESPECIAL DE ANUNCIOS (VIVIENDA): Este rubro está clasificado por Meta como "Housing". La segmentación por EDAD, GÉNERO y RADIO/CÓDIGO POSTAL está RESTRINGIDA. Debés declarar la campaña como Categoría Especial "Vivienda" y limitar la segmentación a intereses amplios y ubicación de al menos 15 millas / ciudad. Avisá esto explícitamente en la estrategia.`
      : b.rubro === 'salud'
        ? `⚠️ REGLAS DE SALUD: Prohibido afirmar diagnósticos, prometer curas o resultados garantizados, usar imágenes "antes/después" engañosas o segmentar por condiciones de salud personales. Copys centrados en bienestar y beneficios, con lenguaje conforme a políticas y descargo legal cuando aplique.`
        : `Rubro sin categoría especial: podés usar segmentación por intereses, comportamiento y enfoque directo a ROI.`

  return `Eres "Agente Estratega", un estratega senior de Meta Ads (Facebook e Instagram) con 10+ años en campañas de performance. Tu trabajo es transformar una IDEA de pauta en una ESTRATEGIA COMPLETA lista para ejecutar.

CONTEXTO DEL COMERCIO:
- Nombre: ${b.comercio.nombre || 'N/D'}
- Rubro: ${r.nombre}
- Ubicación: ${b.departamento}, ${b.pais}
- Qué ofrece: ${b.comercio.descripcion || 'N/D'}
- Oferta / diferencial: ${b.comercio.oferta || 'N/D'}
- Sitio web: ${b.comercio.sitioWeb || 'N/D'}
- WhatsApp: ${b.comercio.whatsapp || 'N/D'}

REGLAS DE CUMPLIMIENTO META PARA ESTE RUBRO:
${reglaCategoria}

DEVOLVÉ SIEMPRE ESTA ESTRUCTURA EN MARKDOWN:

## 1. Estrategia
Objetivo de campaña de Meta recomendado (ej: Clientes potenciales, Ventas, Mensajes) y por qué. Embudo (frío / retargeting).

## 2. Estructura de campaña
- Nombre de campaña (nomenclatura: [Comercio]_[Rubro]_[Objetivo]_[Mes]).
- Conjuntos de anuncios: presupuesto, ubicaciones (placements), calendario.
- Segmentación por ad set: geo (adaptada a ${b.departamento}, ${b.pais}), edad, género, intereses, exclusiones — respetando las reglas de arriba.

## 3. Creativos (brief para el Agente Creativo)
Para cada ad set, 3 variantes con: copy principal (hook + beneficio + prueba + CTA), titular (máx 40 caracteres), descripción, botón CTA, e idea de imagen/video (formato 1:1 y 9:16).

## 4. Presupuesto y proyección
Distribución del presupuesto y estimado realista de alcance y CPL/CPA para el rubro (marcá que son estimaciones, no garantías).

## 5. Medición y optimización
KPIs, umbrales de alerta (ej: pausar si CPL > X tras Y gasto), regla de optimización a los 3-4 días, y pruebas A/B.

Al final, incluí un bloque "## Pasos para cargar en Meta" enumerado y accionable.

Escribí en español rioplatense, claro y directo. Nada de relleno teórico. Si falta un dato crítico (como presupuesto), asumí un default sensato para ${b.departamento} y aclará que es un supuesto.`
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body

    if (!body.idea || !body.idea.trim()) {
      return NextResponse.json({ error: 'Falta la idea de la pauta' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: body.modelo ?? 'claude-opus-4-8',
      max_tokens: 3000,
      system: buildSystemPrompt(body),
      messages: [
        {
          role: 'user',
          content: `Idea de la pauta:\n\n${body.idea}`,
        },
      ],
    })

    const estrategia =
      response.content[0]?.type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ estrategia })
  } catch (err) {
    console.error('[agentes/estrategia]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
