import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TONO_EXTRA: Record<string, string> = {
  amigable: 'Usá un tono cálido y cercano.',
  profesional: 'Usá un tono profesional y preciso.',
  entusiasta: 'Mostrá entusiasmo y energía positiva.',
  formal: 'Usá un tono formal y respetuoso.',
}

interface SocioResumen {
  nombre: string
  categoria: string
  descripcion?: string
  direccion?: string
  urlTour?: string
  whatsapp?: string
  web?: string
}

export async function POST(req: NextRequest) {
  try {
    const { mensajes, config, socios } = await req.json()

    if (!mensajes || !Array.isArray(mensajes)) {
      return NextResponse.json({ error: 'mensajes inválidos' }, { status: 400 })
    }

    const tonoExtra = TONO_EXTRA[config?.tono] ?? ''

    // Build socios context block
    let sociosContext = ''
    if (socios && Array.isArray(socios) && socios.length > 0) {
      const lineas = (socios as SocioResumen[]).map(s => {
        const parts = [`• ${s.nombre} (${s.categoria})`]
        if (s.descripcion) parts.push(`  Descripción: ${s.descripcion}`)
        if (s.direccion) parts.push(`  Dirección: ${s.direccion}`)
        if (s.urlTour) parts.push(`  🎥 Tour virtual: ${s.urlTour}`)
        if (s.whatsapp) parts.push(`  📱 WhatsApp: ${s.whatsapp}`)
        if (s.web) parts.push(`  🌐 Web: ${s.web}`)
        return parts.join('\n')
      })
      sociosContext = `\n\nSOCIOS ACTIVOS DE MENDOZA BUREAU:\n${lineas.join('\n\n')}`
    }

    const systemPrompt = [
      config?.promptSistema ?? '',
      tonoExtra,
      sociosContext,
      '\nCuando el usuario pregunta por un tour virtual, siempre incluí el link exacto del tour en tu respuesta.',
      'Respondé siempre en español.',
    ].filter(Boolean).join('\n')

    const messages = mensajes.map((m: { rol: string; contenido: string }) => ({
      role: m.rol as 'user' | 'assistant',
      content: m.contenido,
    }))

    const response = await client.messages.create({
      model: config?.modelo ?? 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const respuesta =
      response.content[0]?.type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ respuesta })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
