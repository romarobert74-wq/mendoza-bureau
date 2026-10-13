// URL base pública de la app. Se configura con la variable de entorno
// NEXT_PUBLIC_BASE_URL en Vercel (ej: https://app.mendozabureau360.com).
// Si no está definida, cae a la URL actual de Vercel para no romper nada.
//
// Usar SIEMPRE para generar links que se copian, comparten o embeben
// (ficha y botonera de los tours, link del formulario del socio, etc.),
// así el día que se migre el hosting no hay que tocar nada: solo cambia
// esta variable.
export const APP_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || 'https://mendoza-bureau.vercel.app'
).replace(/\/+$/, '')
