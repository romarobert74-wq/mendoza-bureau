import { NextRequest, NextResponse } from 'next/server'
import { correrEstratega, type EstrategaInput } from '@/lib/agentes-core'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EstrategaInput
    if (!body.idea?.trim()) {
      return NextResponse.json({ error: 'Falta la idea de la pauta' }, { status: 400 })
    }
    const estrategia = await correrEstratega(body)
    return NextResponse.json({ estrategia })
  } catch (err) {
    console.error('[agentes/estrategia]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
