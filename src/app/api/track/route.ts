import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

// Endpoint público de tracking para los tours 3DVista alojados en OTRO dominio
// (mendozabureau360.com). El puente.js del tour le manda:
//   - { socioId, tipo:'tour' }                → ingreso al tour (cuenta 1 visita)
//   - { socioId, tipo:'webframe_tiempo', ms } → permanencia (tiempo de la sesión)
// Escribe en la colección 'analytics' con Admin SDK (las reglas no permiten
// escritura directa desde el cliente). CORS abierto porque el origen es externo.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
}

const TIPOS = new Set(['tour', 'webframe_tiempo', 'panorama'])
const MAX_MS = 4 * 60 * 60 * 1000  // techo de 4 h para descartar basura
const MIN_MS = 3000                // descarta sesiones < 3 s (rebotes/bots)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    // sendBeacon manda text/plain; fetch con string también → parseamos texto.
    let body: { socioId?: string; tipo?: string; ms?: unknown } | null = null
    try {
      const txt = await req.text()
      body = txt ? JSON.parse(txt) : null
    } catch { body = null }
    if (!body) return NextResponse.json({ error: 'body' }, { status: 400, headers: CORS })

    const socioId = String(body.socioId || '').trim().slice(0, 80)
    const tipo = String(body.tipo || '').trim()
    if (!socioId || !TIPOS.has(tipo)) {
      return NextResponse.json({ error: 'invalido' }, { status: 400, headers: CORS })
    }

    let ms: number | undefined
    if (tipo === 'webframe_tiempo') {
      const n = Number(body.ms)
      ms = Number.isFinite(n) ? Math.min(Math.round(n), MAX_MS) : 0
      if (!ms || ms < MIN_MS) {
        // sesión demasiado corta → no la registramos (no ensucia el promedio)
        return NextResponse.json({ ok: true, skip: 'corto' }, { headers: CORS })
      }
    }

    const admin = getAdminDb()
    if (!admin) {
      // Sin Admin SDK no podemos escribir (reglas bloquean create en analytics).
      return NextResponse.json({ error: 'sin-admin' }, { status: 503, headers: CORS })
    }

    await admin.collection('analytics').add({
      socioId,
      tipo,
      ...(ms !== undefined ? { ms } : {}),
      origen: 'tour3d',
      timestamp: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error('[track]', err)
    return NextResponse.json({ error: 'error' }, { status: 500, headers: CORS })
  }
}
