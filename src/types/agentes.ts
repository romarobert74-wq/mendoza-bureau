import { Timestamp } from 'firebase/firestore'

// ─────────────────────────────────────────────────────────────
//  Plataforma multi-agente — tipos base
// ─────────────────────────────────────────────────────────────

export type TipoAgente =
  | 'estratega'      // idea → estrategia de pauta
  | 'creativos'      // estrategia → creativos (fotos, carruseles, videos)
  | 'publicador'     // estrategia → campaña armada en Meta Ads
  | 'community'      // responde mensajes de WhatsApp / Instagram
  | 'prospector'     // busca prospectos según rubro

export type Rubro =
  | 'inmobiliaria'
  | 'marketing'
  | 'venta_casas'
  | 'salud'

export type Plataforma =
  | 'meta_ads'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'web'

export type EstadoAgente = 'activo' | 'pausado' | 'proximamente'

// ── Datos del comercio que gestiona el agente ──────────────
export interface Comercio {
  nombre: string
  descripcion: string      // qué vende / ofrece
  oferta: string           // promo o diferencial concreto
  sitioWeb: string
  whatsapp: string
}

// ── Un campo de credencial de una plataforma ───────────────
export interface CampoCredencial {
  key: string
  label: string
  placeholder: string
  sensible: boolean        // true = token/secret, se enmascara en UI
}

// ── Instancia de agente guardada en Firestore ──────────────
export interface Agente {
  id: string
  tipo: TipoAgente
  nombre: string           // nombre custom que le pone el usuario
  rubro: Rubro
  pais: string
  departamento: string
  comercio: Comercio
  credenciales: Record<string, string>   // key de CampoCredencial → valor
  estado: EstadoAgente
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}

export type AgenteFormData = Omit<Agente, 'id' | 'creadoEn' | 'actualizadoEn'>

// ─────────────────────────────────────────────────────────────
//  Catálogos / metadata
// ─────────────────────────────────────────────────────────────

export interface TipoAgenteMeta {
  tipo: TipoAgente
  nombre: string
  descripcion: string
  emoji: string            // "carita / dibujo tecnológico"
  color: string            // color de acento de la tarjeta
  plataformas: Plataforma[]  // credenciales que requiere
  disponible: boolean      // false = "próximamente"
}

export const TIPOS_AGENTE: TipoAgenteMeta[] = [
  {
    tipo: 'estratega',
    nombre: 'Agente Estratega',
    descripcion: 'Le das la idea de la pauta y elabora la estrategia completa: objetivo, público, presupuesto y estructura.',
    emoji: '🧠',
    color: '#2563eb',
    plataformas: [],
    disponible: true,
  },
  {
    tipo: 'creativos',
    nombre: 'Agente Creativo',
    descripcion: 'Toma la estrategia y la transforma en creativos: copies, ideas de fotos, carruseles y guiones de video.',
    emoji: '🎨',
    color: '#f97316',
    plataformas: ['web'],
    disponible: false,
  },
  {
    tipo: 'publicador',
    nombre: 'Agente Publicador',
    descripcion: 'Arma y carga la campaña en Meta Ads (en estado pausado para tu revisión).',
    emoji: '🚀',
    color: '#8b5cf6',
    plataformas: ['meta_ads', 'facebook', 'instagram'],
    disponible: true,
  },
  {
    tipo: 'community',
    nombre: 'Agente Community',
    descripcion: 'Responde automáticamente los mensajes entrantes de WhatsApp e Instagram.',
    emoji: '💬',
    color: '#22c55e',
    plataformas: ['whatsapp', 'instagram', 'facebook'],
    disponible: false,
  },
  {
    tipo: 'prospector',
    nombre: 'Agente Prospector',
    descripcion: 'Busca prospectos potenciales según el rubro y arma listas de contactos.',
    emoji: '🔍',
    color: '#06b6d4',
    plataformas: ['web', 'meta_ads'],
    disponible: false,
  },
]

export function getTipoAgenteMeta(tipo: TipoAgente): TipoAgenteMeta {
  return TIPOS_AGENTE.find(t => t.tipo === tipo) ?? TIPOS_AGENTE[0]
}

// ── Rubros con sus reglas de Meta ──────────────────────────
export interface RubroMeta {
  rubro: Rubro
  nombre: string
  emoji: string
  // Categoría especial de anuncios de Meta (restringe segmentación)
  categoriaEspecial: 'HOUSING' | 'NONE'
  advertencia: string
}

export const RUBROS: RubroMeta[] = [
  {
    rubro: 'inmobiliaria',
    nombre: 'Inmobiliaria',
    emoji: '🏢',
    categoriaEspecial: 'HOUSING',
    advertencia: 'Categoría Especial "Vivienda": Meta restringe segmentación por edad, género y radio geográfico.',
  },
  {
    rubro: 'venta_casas',
    nombre: 'Venta de Casas',
    emoji: '🏠',
    categoriaEspecial: 'HOUSING',
    advertencia: 'Categoría Especial "Vivienda": Meta restringe segmentación por edad, género y radio geográfico.',
  },
  {
    rubro: 'marketing',
    nombre: 'Marketing / Agencia',
    emoji: '📈',
    categoriaEspecial: 'NONE',
    advertencia: '',
  },
  {
    rubro: 'salud',
    nombre: 'Salud',
    emoji: '⚕️',
    categoriaEspecial: 'NONE',
    advertencia: 'Salud: prohibido prometer curas, diagnósticos o usar "antes/después" engañosos. Sin segmentar por condiciones personales.',
  },
]

export function getRubroMeta(rubro: Rubro): RubroMeta {
  return RUBROS.find(r => r.rubro === rubro) ?? RUBROS[0]
}

// ── Especificación de credenciales por plataforma ──────────
export const CREDENCIALES_PLATAFORMA: Record<Plataforma, { nombre: string; campos: CampoCredencial[] }> = {
  meta_ads: {
    nombre: 'Meta Ads (Marketing API)',
    campos: [
      { key: 'meta_app_id', label: 'App ID', placeholder: '1234567890', sensible: false },
      { key: 'meta_app_secret', label: 'App Secret', placeholder: '••••••••', sensible: true },
      { key: 'meta_access_token', label: 'Access Token', placeholder: 'EAAG...', sensible: true },
      { key: 'meta_ad_account_id', label: 'Ad Account ID', placeholder: 'act_1234567890', sensible: false },
      { key: 'meta_business_id', label: 'Business ID', placeholder: '1234567890', sensible: false },
    ],
  },
  facebook: {
    nombre: 'Facebook Page',
    campos: [
      { key: 'fb_page_id', label: 'Page ID', placeholder: '1234567890', sensible: false },
      { key: 'fb_page_token', label: 'Page Access Token', placeholder: 'EAAG...', sensible: true },
    ],
  },
  instagram: {
    nombre: 'Instagram Business',
    campos: [
      { key: 'ig_account_id', label: 'IG Business Account ID', placeholder: '1784...', sensible: false },
      { key: 'ig_access_token', label: 'Access Token', placeholder: 'EAAG...', sensible: true },
    ],
  },
  tiktok: {
    nombre: 'TikTok',
    campos: [
      { key: 'tt_app_id', label: 'App ID', placeholder: '7012...', sensible: false },
      { key: 'tt_access_token', label: 'Access Token', placeholder: '••••••••', sensible: true },
      { key: 'tt_advertiser_id', label: 'Advertiser ID', placeholder: '7012...', sensible: false },
    ],
  },
  whatsapp: {
    nombre: 'WhatsApp Business',
    campos: [
      { key: 'wa_phone_id', label: 'Phone Number ID', placeholder: '1234567890', sensible: false },
      { key: 'wa_business_id', label: 'WhatsApp Business Account ID', placeholder: '1234567890', sensible: false },
      { key: 'wa_access_token', label: 'Access Token', placeholder: 'EAAG...', sensible: true },
    ],
  },
  web: {
    nombre: 'Sitio Web',
    campos: [
      { key: 'web_url', label: 'URL del sitio', placeholder: 'https://tucomercio.com', sensible: false },
    ],
  },
}

export const COMERCIO_VACIO = (): Comercio => ({
  nombre: '',
  descripcion: '',
  oferta: '',
  sitioWeb: '',
  whatsapp: '',
})
