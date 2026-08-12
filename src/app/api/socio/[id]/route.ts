import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

// Ficha del socio para el WebFrame del tour: socio + fotos en UNA sola llamada,
// cacheada en el edge de Vercel para que el webframe cargue rapidísimo.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'sin id' }, { status: 400 })

  try {
    let socio: Record<string, unknown> | null = null
    let fotos: Record<string, unknown>[] = []
    const admin = getAdminDb()

    if (admin) {
      const s = await admin.collection('socios').doc(id).get()
      if (s.exists) socio = { id: s.id, ...s.data() }
      const fs = await admin.collection('socios').doc(id).collection('fotos').get()
      fotos = fs.docs.map(d => ({ id: d.id, ...d.data() }))
    } else {
      const app = getApps().find(a => a.name === 'socio-api') ?? initializeApp(firebaseConfig, 'socio-api')
      const db = getFirestore(app)
      const s = await getDoc(doc(db, 'socios', id))
      if (s.exists()) socio = { id: s.id, ...s.data() }
      const fs = await getDocs(collection(db, 'socios', id, 'fotos'))
      fotos = fs.docs.map(d => ({ id: d.id, ...d.data() }))
    }

    if (!socio) return NextResponse.json({ error: 'no encontrado' }, { status: 404 })

    return NextResponse.json({ socio, fotos }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[socio]', err)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}
