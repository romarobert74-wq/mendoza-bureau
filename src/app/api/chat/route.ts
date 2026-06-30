import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TONO_EXTRA: Record<string, string> = {
  amigable: 'Usá un tono cálido y cercano.',
  profesional: 'Usá un tono profesional y preciso.',
  entusiasta: 'Mostrá entusiasmo y energía positiva.',
  formal: 'Usá un tono formal y respetuoso.',
}

export async function POST(req: NextRequest) {
  try {
    const { mensajes, config } = await req.json()

    if (!mensajes || !Array.isArray(mensajes)) {
      return NextResponse.json({ error: 'mensajes inválidos' }, { status: 400 })
    }

    const tonoExtra = TONO_EXTRA[config?.tono] ?? ''
    const systemPrompt = `${config?.promptSistema ?? ''}\n${tonoExtra}`.trim()

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
