import { Timestamp } from 'firebase/firestore'

export type Rol = 'el_faro' | 'bureau' | 'socio'

export type CategoriaSocio =
  | 'bodega'
  | 'restaurante'
  | 'hotel'
  | 'alojamiento'
  | 'servicio'
  | 'otro'

export interface Usuario {
  uid: string
  email: string
  nombre: string
  rol: Rol
  socioId?: string
  creadoEn: Timestamp
}

export interface Socio {
  id: string
  razonSocial: string
  etiqueta: string
  categoria: CategoriaSocio
  direccion: string
  contacto: {
    whatsapp: string
    email: string
    web: string
    redes: string
  }
  infoGeneral: string
  fotoPortada: string
  logoUrl: string
  activo: boolean
  ubicacionUrl: string
  urlInternaTour: string
  urlInternaVuelta: string
  urlDrive: string
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}

export type SocioFormData = Omit<Socio, 'id' | 'creadoEn' | 'actualizadoEn'>

export const CATEGORIAS: Record<CategoriaSocio, string> = {
  bodega: 'Bodega',
  restaurante: 'Restaurante',
  hotel: 'Hotel',
  alojamiento: 'Alojamiento',
  servicio: 'Servicio',
  otro: 'Otro',
}

export const ROLES: Record<Rol, string> = {
  el_faro: 'El Faro (Superadmin)',
  bureau: 'Bureau (Admin)',
  socio: 'Socio',
}
