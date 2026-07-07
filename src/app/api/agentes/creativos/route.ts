import { NextRequest, NextResponse } from 'next/server'
import { correrCreativo, type CreativoInput } from '@/lib/agentes-core'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreativoInput
    if (!body.idea?.trim()) {
      return NextResponse.json({ error: 'Falta la idea de la pauta' }, { status: 400 })
    }
    const out = await correrCreativo(body)
    return NextResponse.json(out)
  } catch (err) {
    console.error('[agentes/creativos]', err)
    return NextResponse.json({ error: (err as Error).message || 'Error interno' }, { status: 500 })
  }
}
