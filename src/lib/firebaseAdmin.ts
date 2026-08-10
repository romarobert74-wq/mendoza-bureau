import 'server-only'
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

/* Firebase Admin SDK — SOLO servidor.
   Se usa en las rutas de API para escribir/leer con privilegios, sin depender
   de las reglas públicas de Firestore y sin ser bloqueado por App Check.

   Requiere la variable FIREBASE_SERVICE_ACCOUNT en Vercel (JSON de la cuenta
   de servicio, en texto plano o en base64). Si NO está definida, getAdminDb()
   devuelve null y la ruta cae en su comportamiento anterior (client SDK), así
   nada se rompe hasta que cargues la credencial.

   IMPORTANTE: FIREBASE_SERVICE_ACCOUNT es un secreto — nunca lleva el prefijo
   NEXT_PUBLIC_ y no debe quedar en el repositorio. */

let cached: Firestore | null = null

function parseServiceAccount(raw: string): Record<string, unknown> | null {
  try {
    const txt = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')
    return JSON.parse(txt)
  } catch {
    return null
  }
}

export function getAdminDb(): Firestore | null {
  if (cached) return cached
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) return null

  const sa = parseServiceAccount(raw)
  if (!sa) {
    console.warn('[admin] FIREBASE_SERVICE_ACCOUNT no se pudo parsear')
    return null
  }

  try {
    const app: App = getApps().find(a => a.name === 'admin') ?? initializeApp({
      credential: cert(sa as Parameters<typeof cert>[0]),
    }, 'admin')
    cached = getFirestore(app)
    return cached
  } catch (e) {
    console.warn('[admin] no se pudo inicializar Admin SDK:', e)
    return null
  }
}
