import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

// Actualiza un socio EXISTENTE desde el formulario público de "completar / editar".
// Solo actualiza los campos del formulario (no toca activo, urls internas, videos, botonera).
// Usa Admin SDK (preferido); si no está, cae a cliente. El id es la única credencial.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Campos que el socio puede completar/editar desde el formulario público
const CAMPOS = new Set([
  'razonSocial', 'etiqueta', 'categoria', 'infoGeneral', 'direccion', 'departamento',
  'ubicacionUrl', 'fotoPortada', 'logoUrl', 'contacto',
  'salones', 'hotelData', 'restauranteData', 'bodegaData', 'alojamientoData', 'servicioData',
])

export async function POST(req: Request) {
  let body: { id?: string; data?: Record<string, unknown> }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'json invalido' }, { status: 400 }) }

  const id = (body.id || '').toString().trim()
  const raw = body.data || {}
  if (!id) return NextResponse.json({ error: 'sin id' }, { status: 400 })

  // Filtra solo los campos permitidos
  const data: Record<string, unknown> = {}
  for (const k of Object.keys(raw)) if (CAMPOS.has(k)) data[k] = raw[k]
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'sin datos' }, { status: 400 })

  try {
    const admin = getAdminDb()
    if (admin) {
      const ref = admin.collection('socios').doc(id)
      const snap = await ref.get()
      if (!snap.exists) return NextResponse.json({ error: 'no encontrado' }, { status: 404 })
      await ref.update({ ...data, actualizadoEn: new Date() })
      return NextResponse.json({ ok: true })
    }
    // Fallback cliente
    const app = getApps().find(a => a.name === 'socio-edit') ?? initializeApp(firebaseConfig, 'socio-edit')
    const db = getFirestore(app)
    await updateDoc(doc(db, 'socios', id), { ...data, actualizadoEn: serverTimestamp() })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[socio-editar]', err)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}
