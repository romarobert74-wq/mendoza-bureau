// Almacenamiento de imágenes SIN dependencias externas: se redimensionan en el
// navegador y se guardan como data URL directamente en Firestore. Es lo que ya
// funcionaba para la galería de fotos; evita Firebase Storage (plan pago) y
// Cloudinary (setup externo).

interface UploadOpts {
  maxPx?: number         // dimensión máxima del lado más largo
  preserveAlpha?: boolean // true → PNG (mantiene transparencia, ideal logos)
  quality?: number        // calidad JPEG (0-1)
}

function procesar(file: File | Blob, opts: UploadOpts): Promise<string> {
  const maxPx = opts.maxPx ?? 1400
  const preserveAlpha = opts.preserveAlpha ?? false
  const quality = opts.quality ?? 0.82

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objUrl)
      const dataUrl = preserveAlpha
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', quality)
      resolve(dataUrl)
    }
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('No se pudo leer la imagen')) }
    img.src = objUrl
  })
}

/**
 * Redimensiona la imagen y devuelve un data URL listo para guardar en Firestore.
 * @param file  Archivo o Blob de imagen
 * @param _path Se ignora (compatibilidad con la firma anterior)
 * @param onProgress  Callback de progreso (0-100)
 * @param opts  Opciones de tamaño/formato
 */
export async function uploadImage(
  file: File | Blob,
  _path?: string,
  onProgress?: (pct: number) => void,
  opts: UploadOpts = {},
): Promise<string> {
  onProgress?.(10)
  const dataUrl = await procesar(file, opts)
  onProgress?.(100)
  return dataUrl
}
