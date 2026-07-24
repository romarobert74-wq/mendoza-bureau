// Fuente única de los servicios adicionales (landing + panel de configuración).
// Los precios acá son los valores por defecto; se pueden sobrescribir desde
// configuracion/landing_servicios (editable en el panel).

export interface ServicioMeta {
  id: string
  nombre: string
  precio: number
}

export const SERVICIOS_META: ServicioMeta[] = [
  { id: 'pano1',    nombre: 'Panorama 360° adicional', precio: 100 },
  { id: 'pack3',    nombre: 'Pack 3 panoramas 360°',   precio: 225 },
  { id: 'pack5',    nombre: 'Pack 5 panoramas 360°',   precio: 350 },
  { id: 'pack10',   nombre: 'Pack 10 panoramas 360°',  precio: 600 },
  { id: 'exp',      nombre: 'Experiencia adicional',    precio: 130 },
  { id: 'premium',  nombre: 'Bloque visual premium',    precio: 450 },
  { id: 'video360', nombre: 'Video 360°',               precio: 350 },
  { id: 'fotohdr',  nombre: 'Fotografías HDR',          precio: 250 },
  { id: 'reel',     nombre: 'Reel vertical',            precio: 250 },
  { id: 'videoh',   nombre: 'Video horizontal',         precio: 250 },
  { id: 'drone',    nombre: 'Servicio de drone',        precio: 250 },
]

export interface LandingConfig {
  precios?: Record<string, number>
  heroImg?: string
  galeria?: string[]
}
