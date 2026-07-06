const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Sube una imagen a Cloudinary (unsigned upload, sin backend propio).
 * @param file   Archivo a subir
 * @param path   Identificador único del asset (soporta "/" como carpetas virtuales), sin extensión
 * @param onProgress  Callback 0-100 con el progreso de subida
 */
export async function uploadImage(
  file: File | Blob,
  path: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary no está configurado (faltan variables de entorno)')
  }

  const publicId = path.replace(/\.[^/.]+$/, '') // Cloudinary asigna su propia extensión

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('public_id', publicId)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        resolve(data.secure_url as string)
      } else {
        reject(new Error('Error al subir la imagen a Cloudinary'))
      }
    }
    xhr.onerror = () => reject(new Error('Error de red al subir la imagen'))
    xhr.send(formData)
  })
}
