import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Firebase (server-side, usa las NEXT_PUBLIC_ que están disponibles acá)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
const app = getApps().find(a => a.name === 'track-api') ?? initializeApp(firebaseConfig, 'track-api')
const db = getFirestore(app)

const TIPOS_VALIDOS = ['tour', 'contacto', 'web', 'redes', 'webframe_tiempo']

export async function POST(req: NextRequest) {
  try {
    const { socioId, tipo, ms } = await req.json()
    if (!socioId || !TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: 'evento inválido' }, { status: 400 })
    }
    await addDoc(collection(db, 'analytics'), {
      socioId,
      tipo,
      ...(typeof ms === 'number' && ms > 0 ? { ms } : {}),
      timestamp: serverTimestamp(),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track]', err)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}
