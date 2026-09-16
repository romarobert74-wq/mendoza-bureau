import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

// Endpoint de tracking de analytics. Lo usan:
//  - Los webframes propios (ficha/contacto), MISMO origen → tipos de click y tiempo.
//  - Los tours 3DVista en mendozabureau360.com (OTRO origen) → ingreso y permanencia.
// Escribe en 'analytics' con Admin SDK (las reglas bloquean create desde cliente).
// CORS abierto para aceptar los envíos cross-origin desde los tours.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
}

// Fallback client SDK (se usa solo si aún no está la credencial de servicio)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const TIPOS_VALIDOS = ['tour', 'contacto', 'web', 'redes', 'webframe_tiempo', 'panorama', 'menu_abierto', 'bot_abierto']
const MAX_MS = 4 * 60 * 60 * 1000  // techo de 4 h para descartar basura

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    // sendBeacon (mismo origen manda application/json; cross-origin manda texto).
    // Parseamos el body como texto para cubrir ambos casos.
    let body: { socioId?: string; tipo?: string; ms?: unknown; nombre?: unknown } | null = null
    try {
      const txt = await req.text()
      body = txt ? JSON.parse(txt) : null
    } catch { body = null }
    if (!body) return NextResponse.json({ error: 'body' }, { status: 400, headers: CORS })

    const socioId = String(body.socioId || '').trim().slice(0, 80)
    const tipo = String(body.tipo || '').trim()
    if (!socioId || !TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: 'evento inválido' }, { status: 400, headers: CORS })
    }

    // Tiempo: válido si es número > 0; se topea a 4 h.
    let ms: number | undefined
    const n = Number(body.ms)
    if (Number.isFinite(n) && n > 0) ms = Math.min(Math.round(n), MAX_MS)
    const conMs = ms !== undefined

    // Nombre del panorama (solo para tipo 'panorama').
    const nombre = tipo === 'panorama' ? String(body.nombre || '').trim().slice(0, 120) : ''

    const doc = {
      socioId,
      tipo,
      ...(conMs ? { ms } : {}),
      ...(nombre ? { nombre } : {}),
    }

    const admin = getAdminDb()
    if (admin) {
      await admin.collection('analytics').add({ ...doc, timestamp: FieldValue.serverTimestamp() })
    } else {
      // Fallback (comportamiento anterior con client SDK)
      const app = getApps().find(a => a.name === 'track-api') ?? initializeApp(firebaseConfig, 'track-api')
      const db = getFirestore(app)
      await addDoc(collection(db, 'analytics'), { ...doc, timestamp: serverTimestamp() })
    }

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error('[track]', err)
    return NextResponse.json({ error: 'error' }, { status: 500, headers: CORS })
  }
}
