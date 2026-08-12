import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

// Config PÚBLICA del chatbot para el widget del tour.
// Devuelve SOLO los campos no sensibles (nunca los documentos/PDFs del
// conocimiento). Así el chat del tour funciona sin leer configuracion/chatbot
// directo, y esa colección puede quedar cerrada por reglas.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export async function GET() {
  try {
    let data: Record<string, unknown> = {}
    const admin = getAdminDb()
    if (admin) {
      const snap = await admin.collection('configuracion').doc('chatbot').get()
      data = snap.exists ? (snap.data() ?? {}) : {}
    } else {
      const app = getApps().find(a => a.name === 'chatcfg-api') ?? initializeApp(firebaseConfig, 'chatcfg-api')
      const snap = await getDoc(doc(getFirestore(app), 'configuracion', 'chatbot'))
      data = snap.exists() ? snap.data() : {}
    }

    // Solo campos seguros (sin documentos ni datos de uso)
    const safe = {
      tono: (data.tono as string) ?? '',
      modelo: (data.modelo as string) ?? '',
      promptSistema: (data.promptSistema as string) ?? '',
      bienvenida: (data.bienvenida as string) ?? '',
    }
    return NextResponse.json(safe, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    console.error('[chat-config]', err)
    return NextResponse.json({}, { status: 200 })
  }
}
