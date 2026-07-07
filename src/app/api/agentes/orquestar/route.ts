import { NextRequest, NextResponse } from 'next/server'
import {
  correrEstratega, correrCreativo, correrPublicador,
  type BaseCtx, type ImagenRef,
} from '@/lib/agentes-core'

// Ejecuta la campaña completa: Estratega → Creativo → Publicador,
// pasando el resultado de cada paso al siguiente. Combina las
// credenciales de todos los agentes del comercio (Canva + Meta).
interface Body extends BaseCtx {
  idea: string
  contextoExtra?: string
  urlsCompetencia?: string[]
  imagenes?: ImagenRef[]
  credenciales: Record<string, string>   // merge de credenciales de los agentes
}

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Body
    if (!b.idea?.trim()) {
      return NextResponse.json({ error: 'Falta la idea de la pauta' }, { status: 400 })
    }

    const ctx: BaseCtx = { rubro: b.rubro, pais: b.pais, departamento: b.departamento, comercio: b.comercio }

    // 1. Estratega
    const estrategia = await correrEstratega({
      ...ctx, idea: b.idea, contextoExtra: b.contextoExtra,
      urlsCompetencia: b.urlsCompetencia, imagenes: b.imagenes,
    })

    // 2. Creativo (con la estrategia como brief)
    const creativos = await correrCreativo({
      ...ctx, idea: b.idea, brief: estrategia, credenciales: b.credenciales,
    })

    // 3. Publicador (con la estrategia como brief y la imagen del creativo)
    const publicador = await correrPublicador({
      ...ctx, idea: b.idea, brief: estrategia,
      imagenUrl: creativos.canva?.imagenUrl,
      credenciales: b.credenciales,
    })

    return NextResponse.json({ estrategia, creativos, publicador })
  } catch (err) {
    console.error('[agentes/orquestar]', err)
    return NextResponse.json({ error: (err as Error).message || 'Error interno' }, { status: 500 })
  }
}
