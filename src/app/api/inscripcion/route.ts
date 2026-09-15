import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

// Lead de inscripción desde la landing /plataforma. Guarda los datos del
// interesado en la colección 'inscripciones' para que Bureau lo contacte.
// Escribe con Admin SDK (preferido); cae a client SDK si no hay credencial.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const str = (v: unknown, max = 400) => String(v ?? '').trim().slice(0, max)

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> | null = null
    try { body = await req.json() } catch { body = null }
    if (!body) return NextResponse.json({ error: 'body' }, { status: 400 })

    const empresa = str(body.empresa, 160)
    const nombre = str(body.nombre, 160)
    const whatsapp = str(body.whatsapp, 60)
    const email = str(body.email, 160)
    const rubro = str(body.rubro, 80)
    const mensaje = str(body.mensaje, 1500)

    // Mínimo: empresa o nombre + un medio de contacto (whatsapp o email)
    if (!(empresa || nombre) || !(whatsapp || email)) {
      return NextResponse.json({ error: 'faltan datos' }, { status: 400 })
    }

    const data = {
      empresa, nombre, whatsapp, email, rubro, mensaje,
      estado: 'nuevo',              // nuevo | contactado | aceptado | descartado
      origen: 'landing_plataforma',
    }

    const admin = getAdminDb()
    if (admin) {
      await admin.collection('inscripciones').add({ ...data, creadoEn: FieldValue.serverTimestamp() })
    } else {
      const app = getApps().find(a => a.name === 'insc-api') ?? initializeApp(firebaseConfig, 'insc-api')
      const db = getFirestore(app)
      await addDoc(collection(db, 'inscripciones'), { ...data, creadoEn: serverTimestamp() })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[inscripcion]', err)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}
