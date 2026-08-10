import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

/* ── App Check (anti-bot / anti-abuso) ─────────────────────────────
   Verifica que las peticiones vengan de tu web real (no de scripts).
   - Solo se inicializa en el navegador y solo si hay clave de reCAPTCHA.
   - Si no hay clave, no hace nada: la app sigue funcionando igual.
   - NO rompe nada hasta que actives "Enforce" en la consola de Firebase.
   - En desarrollo, poné NEXT_PUBLIC_APPCHECK_DEBUG=<token> para el token
     de depuración (o "true" para que la consola te genere uno). */
if (typeof window !== 'undefined') {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const w = window as unknown as { __mbAppCheck?: boolean; FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }
  if (siteKey && !w.__mbAppCheck) {
    try {
      const debug = process.env.NEXT_PUBLIC_APPCHECK_DEBUG
      if (debug) w.FIREBASE_APPCHECK_DEBUG_TOKEN = debug === 'true' ? true : debug
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      })
      w.__mbAppCheck = true
    } catch (e) {
      console.warn('[appcheck] no se pudo inicializar:', e)
    }
  }
}

export const auth = getAuth(app)
export const db = getFirestore(app)

export const getAnalyticsInstance = async () => {
  if (await isSupported()) return getAnalytics(app)
  return null
}

export default app
