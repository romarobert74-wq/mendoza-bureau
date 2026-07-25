import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Socio, SocioFormData, Usuario } from '@/types'
import type { LandingConfig } from './serviciosAdicionales'

// ── Usuarios ──────────────────────────────────────────────

export async function getUsuario(uid: string): Promise<Usuario | null> {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() } as Usuario
}

export async function getUsuarios(): Promise<Usuario[]> {
  const snap = await getDocs(collection(db, 'usuarios'))
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }) as Usuario)
}

export async function crearUsuario(uid: string, data: Omit<Usuario, 'uid' | 'creadoEn'>) {
  await setDoc(doc(db, 'usuarios', uid), {
    ...data,
    creadoEn: serverTimestamp(),
  })
}

export async function actualizarUsuario(uid: string, data: Partial<Omit<Usuario, 'uid' | 'creadoEn'>>) {
  await updateDoc(doc(db, 'usuarios', uid), data)
}

export async function eliminarUsuario(uid: string) {
  await deleteDoc(doc(db, 'usuarios', uid))
}

// ── Socios ────────────────────────────────────────────────

export async function getSocios(): Promise<Socio[]> {
  const q = query(collection(db, 'socios'), orderBy('razonSocial', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Socio)
}

export async function getSociosByCategoria(categoria: string): Promise<Socio[]> {
  const q = query(
    collection(db, 'socios'),
    where('categoria', '==', categoria),
    orderBy('razonSocial', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Socio)
}

export async function getSocio(id: string): Promise<Socio | null> {
  const snap = await getDoc(doc(db, 'socios', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Socio
}

export async function crearSocio(data: SocioFormData): Promise<string> {
  const ref = await addDoc(collection(db, 'socios'), {
    ...data,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function actualizarSocio(id: string, data: Partial<SocioFormData>) {
  await updateDoc(doc(db, 'socios', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

export async function eliminarSocio(id: string) {
  await deleteDoc(doc(db, 'socios', id))
}

// ── Configuración tour madre ──────────────────────────────

export async function getConfigTourMadre() {
  const snap = await getDoc(doc(db, 'configuracion', 'tour_madre'))
  if (!snap.exists()) return null
  return snap.data()
}

export async function setConfigTourMadre(data: Record<string, unknown>) {
  await setDoc(doc(db, 'configuracion', 'tour_madre'), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

// ── Fotos de socio (subcollection) ───────────────────────

export interface FotoSocio { id: string; url: string; orden: number; nombre: string }

export async function getFotosSocio(socioId: string): Promise<FotoSocio[]> {
  const q = query(collection(db, 'socios', socioId, 'fotos'), orderBy('orden', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FotoSocio))
}

export async function addFotoSocio(socioId: string, data: Omit<FotoSocio, 'id'>) {
  return addDoc(collection(db, 'socios', socioId, 'fotos'), data)
}

export async function deleteFotoSocio(socioId: string, fotoId: string) {
  await deleteDoc(doc(db, 'socios', socioId, 'fotos', fotoId))
}

export async function reorderFotosSocio(socioId: string, fotos: FotoSocio[]) {
  await Promise.all(fotos.map((f, i) => updateDoc(doc(db, 'socios', socioId, 'fotos', f.id), { orden: i })))
}

// ── Web Bureau ───────────────────────────────────────────

export async function getWebBureauConfig() {
  const snap = await getDoc(doc(db, 'web_bureau', 'config'))
  if (!snap.exists()) return null
  return snap.data()
}

export async function setWebBureauConfig(data: Record<string, unknown>) {
  await setDoc(doc(db, 'web_bureau', 'config'), { ...data, updatedAt: serverTimestamp() })
}

export async function getPrensaItems() {
  const q = query(collection(db, 'web_bureau_prensa'), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function crearPrensaItem(data: Record<string, unknown>) {
  return addDoc(collection(db, 'web_bureau_prensa'), { ...data, creadoEn: serverTimestamp() })
}

export async function actualizarPrensaItem(id: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, 'web_bureau_prensa', id), data)
}

export async function eliminarPrensaItem(id: string) {
  await deleteDoc(doc(db, 'web_bureau_prensa', id))
}

export async function getObservatorioItems() {
  const q = query(collection(db, 'web_bureau_observatorio'), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function crearObservatorioItem(data: Record<string, unknown>) {
  return addDoc(collection(db, 'web_bureau_observatorio'), { ...data, creadoEn: serverTimestamp() })
}

export async function actualizarObservatorioItem(id: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, 'web_bureau_observatorio', id), data)
}

export async function eliminarObservatorioItem(id: string) {
  await deleteDoc(doc(db, 'web_bureau_observatorio', id))
}

// ── Configuración del sistema (departamentos, categorías, etc.) ──

export interface ItemLista { id: string; nombre: string }

export interface ConfigSistema {
  departamentos: ItemLista[]
  categoriasExtra: ItemLista[]
  logoUrl?: string
  logoElFaroUrl?: string
  logoBureauBlanco?: string   // versión ícono a color + letras blancas (para fondos oscuros)
  logoElFaroBlanco?: string   // versión El Faro en blanco
}

export async function getConfigSistema(): Promise<ConfigSistema | null> {
  const snap = await getDoc(doc(db, 'configuracion', 'sistema'))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    departamentos: (d.departamentos ?? []) as ItemLista[],
    categoriasExtra: (d.categoriasExtra ?? []) as ItemLista[],
    logoUrl: (d.logoUrl ?? '') as string,
    logoElFaroUrl: (d.logoElFaroUrl ?? '') as string,
    logoBureauBlanco: (d.logoBureauBlanco ?? '') as string,
    logoElFaroBlanco: (d.logoElFaroBlanco ?? '') as string,
  }
}

export async function setConfigSistema(data: ConfigSistema) {
  await setDoc(doc(db, 'configuracion', 'sistema'), {
    ...data,
    actualizadoEn: serverTimestamp(),
  }, { merge: true })
}

// ── Landing de servicios adicionales (precios + imágenes editables) ──

export async function getLandingServicios(): Promise<LandingConfig | null> {
  const snap = await getDoc(doc(db, 'configuracion', 'landing_servicios'))
  if (!snap.exists()) return null
  return snap.data() as LandingConfig
}

export async function setLandingServicios(data: LandingConfig) {
  await setDoc(doc(db, 'configuracion', 'landing_servicios'), {
    ...data,
    actualizadoEn: serverTimestamp(),
  }, { merge: true })
}

// ── Plan de migración a infraestructura propia (checklist + notas) ──

export interface ConfigMigracion {
  checklist: Record<string, boolean>
  notas: string
}

export async function getConfigMigracion(): Promise<ConfigMigracion> {
  const snap = await getDoc(doc(db, 'configuracion', 'migracion'))
  if (!snap.exists()) return { checklist: {}, notas: '' }
  const d = snap.data()
  return {
    checklist: (d.checklist ?? {}) as Record<string, boolean>,
    notas: (d.notas ?? '') as string,
  }
}

export async function setConfigMigracion(data: ConfigMigracion) {
  await setDoc(doc(db, 'configuracion', 'migracion'), {
    ...data,
    actualizadoEn: serverTimestamp(),
  }, { merge: true })
}

// ── Analytics ────────────────────────────────────────────

export type TipoEvento =
  | 'tour'            // entró / abrió el tour del socio (visita al webframe)
  | 'contacto'       // click en botón de contacto (whatsapp/email)
  | 'web'            // click en link de la web del socio
  | 'redes'          // click en redes sociales
  | 'webframe_tiempo' // tiempo de permanencia (trae campo ms)

export async function registrarClick(socioId: string, tipo: string, ms?: number) {
  await addDoc(collection(db, 'analytics'), {
    socioId,
    tipo,
    ...(typeof ms === 'number' ? { ms } : {}),
    timestamp: serverTimestamp(),
  })
}

export interface AnalyticsSocio {
  tour: number
  contacto: number
  web: number
  redes: number
  visitas: number      // sesiones con tiempo registrado
  tiempoMs: number     // tiempo total en webframe
}

export interface AnalyticsResumen {
  porSocio: Record<string, AnalyticsSocio>
  total: AnalyticsSocio
  serieVisitas: { fecha: string; visitas: number }[]   // visitas (tour) por día, últimos 30 días
}

const EVENTO_VACIO = (): AnalyticsSocio => ({
  tour: 0, contacto: 0, web: 0, redes: 0, visitas: 0, tiempoMs: 0,
})

export async function getAnalyticsResumen(): Promise<AnalyticsResumen> {
  const snap = await getDocs(collection(db, 'analytics'))
  const porSocio: Record<string, AnalyticsSocio> = {}
  const total = EVENTO_VACIO()
  const porDia: Record<string, number> = {}   // 'YYYY-MM-DD' -> visitas (tour)

  snap.docs.forEach(d => {
    const data = d.data() as { socioId?: string; tipo?: string; ms?: number; timestamp?: { toDate?: () => Date } }
    const { socioId, tipo, ms } = data
    if (!socioId) return
    if (!porSocio[socioId]) porSocio[socioId] = EVENTO_VACIO()
    const s = porSocio[socioId]
    if (tipo === 'webframe_tiempo') {
      const dur = typeof ms === 'number' ? ms : 0
      s.tiempoMs += dur; s.visitas += 1
      total.tiempoMs += dur; total.visitas += 1
    } else if (tipo === 'tour' || tipo === 'contacto' || tipo === 'web' || tipo === 'redes') {
      s[tipo] += 1
      total[tipo] += 1
      if (tipo === 'tour') {
        const ts = data.timestamp?.toDate?.()
        if (ts) { const k = ts.toISOString().slice(0, 10); porDia[k] = (porDia[k] ?? 0) + 1 }
      }
    }
  })

  // Serie de los últimos 30 días (rellena con 0 los días sin datos)
  const serieVisitas: { fecha: string; visitas: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i)
    const k = dt.toISOString().slice(0, 10)
    serieVisitas.push({ fecha: k, visitas: porDia[k] ?? 0 })
  }

  return { porSocio, total, serieVisitas }
}

// Estadísticas de un socio dentro de un rango de fechas (para reportes mensuales/trimestrales)
export async function getAnalyticsSocioPeriodo(
  socioId: string,
  desde: Date,
  hasta: Date,
): Promise<AnalyticsSocio> {
  const q = query(collection(db, 'analytics'), where('socioId', '==', socioId))
  const snap = await getDocs(q)
  const acc = EVENTO_VACIO()
  snap.docs.forEach(d => {
    const data = d.data() as { tipo?: string; ms?: number; timestamp?: { toDate?: () => Date } }
    const ts = data.timestamp?.toDate?.()
    if (!ts || ts < desde || ts > hasta) return
    if (data.tipo === 'webframe_tiempo') {
      acc.tiempoMs += typeof data.ms === 'number' ? data.ms : 0
      acc.visitas += 1
    } else if (data.tipo === 'tour' || data.tipo === 'contacto' || data.tipo === 'web' || data.tipo === 'redes') {
      acc[data.tipo] += 1
    }
  })
  return acc
}

// ── Backups (copias de seguridad) ────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BackupData {
  version: number
  fecha: string
  colecciones: Record<string, any[]>
}

export interface SnapshotNube {
  id: string
  fecha: string
  resumen: Record<string, number>
  nota?: string
}

// Colecciones "planas" (docs directos, sin subcolecciones)
const COLECCIONES_PLANAS = [
  'usuarios',
  'configuracion',
  'web_bureau',
  'web_bureau_prensa',
  'web_bureau_observatorio',
]

// Genera un backup COMPLETO (incluye imágenes en base64). Para descarga local.
export async function generarBackupCompleto(incluirAnalytics = true): Promise<BackupData> {
  const colecciones: Record<string, any[]> = {}

  // socios + subcolección fotos
  const sociosSnap = await getDocs(collection(db, 'socios'))
  const socios: any[] = []
  for (const d of sociosSnap.docs) {
    const fotosSnap = await getDocs(collection(db, 'socios', d.id, 'fotos'))
    socios.push({ id: d.id, ...d.data(), _fotos: fotosSnap.docs.map(f => ({ id: f.id, ...f.data() })) })
  }
  colecciones.socios = socios

  for (const c of COLECCIONES_PLANAS) {
    const snap = await getDocs(collection(db, c))
    colecciones[c] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  if (incluirAnalytics) {
    const snap = await getDocs(collection(db, 'analytics'))
    colecciones.analytics = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  return { version: 1, fecha: new Date().toISOString(), colecciones }
}

// Cuenta registros por colección (para el resumen en pantalla)
export function contarBackup(b: BackupData): Record<string, number> {
  const r: Record<string, number> = {}
  for (const [k, v] of Object.entries(b.colecciones)) r[k] = v.length
  return r
}

// Restaura un backup (merge: agrega/actualiza, nunca borra registros extra)
export async function restaurarBackup(data: BackupData): Promise<void> {
  for (const s of data.colecciones.socios ?? []) {
    const { id, _fotos, ...rest } = s
    if (!id) continue
    await setDoc(doc(db, 'socios', id), rest, { merge: true })
    for (const f of _fotos ?? []) {
      const { id: fid, ...frest } = f
      if (fid) await setDoc(doc(db, 'socios', id, 'fotos', fid), frest, { merge: true })
    }
  }
  for (const c of COLECCIONES_PLANAS) {
    for (const d of data.colecciones[c] ?? []) {
      const { id, ...rest } = d
      if (id) await setDoc(doc(db, c, id), rest, { merge: true })
    }
  }
}

// Quita RECURSIVAMENTE cualquier imagen base64 (data:...) y las fotos, esté
// donde esté, para que el snapshot entre en un documento (<1MB de Firestore).
function quitarPesados(o: any): any {
  if (Array.isArray(o)) {
    // en arrays mantenemos la longitud (imagen -> '')
    return o.map(v => (typeof v === 'string' && v.startsWith('data:')) ? '' : quitarPesados(v))
  }
  if (o && typeof o === 'object') {
    const r: Record<string, any> = {}
    for (const [k, v] of Object.entries(o)) {
      if (k === '_fotos') continue                             // las fotos van en el backup local
      if (typeof v === 'string' && v.startsWith('data:')) continue  // OMITIMOS la imagen (así al restaurar no pisa la foto viva)
      r[k] = quitarPesados(v)
    }
    return r
  }
  return o
}

// Guarda un snapshot LIGERO (solo texto, sin imágenes) en la nube (Firestore).
export async function guardarSnapshotNube(nota?: string): Promise<void> {
  const full = await generarBackupCompleto(false)
  const datos: Record<string, any[]> = {}
  for (const [k, v] of Object.entries(full.colecciones)) datos[k] = v.map(quitarPesados)
  const resumen = contarBackup(full)
  const payload = { fecha: new Date().toISOString(), resumen, nota: nota ?? '', datos }

  // Guarda de Firestore: el documento no puede superar 1MB. Avisamos con claridad.
  try {
    const size = new Blob([JSON.stringify(payload)]).size
    if (size > 950_000) {
      throw new Error(
        `El snapshot pesa ${Math.round(size / 1024)} KB y supera el límite de 1 MB de la nube. ` +
        `Usá el "Backup local completo" (no tiene ese límite).`
      )
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('límite')) throw e
    // si Blob no está disponible por algún motivo, seguimos e intentamos igual
  }

  const id = new Date().toISOString().replace(/[:.]/g, '-')
  await setDoc(doc(db, 'backups', id), payload)
}

export async function listarSnapshots(): Promise<SnapshotNube[]> {
  const snap = await getDocs(collection(db, 'backups'))
  return snap.docs
    .map(d => {
      const x = d.data()
      return { id: d.id, fecha: x.fecha as string, resumen: (x.resumen ?? {}) as Record<string, number>, nota: x.nota as string }
    })
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

export async function getSnapshotData(id: string): Promise<BackupData | null> {
  const snap = await getDoc(doc(db, 'backups', id))
  if (!snap.exists()) return null
  const x = snap.data()
  return { version: 1, fecha: x.fecha as string, colecciones: (x.datos ?? {}) as Record<string, any[]> }
}

export async function eliminarSnapshot(id: string): Promise<void> {
  await deleteDoc(doc(db, 'backups', id))
}

// Conteo liviano de registros (sin descargar los documentos)
export async function contarRegistros(): Promise<Record<string, number>> {
  const cols = ['socios', 'usuarios', 'configuracion', 'web_bureau', 'web_bureau_prensa', 'web_bureau_observatorio', 'analytics']
  const r: Record<string, number> = {}
  await Promise.all(cols.map(async c => {
    try {
      const snap = await getCountFromServer(collection(db, c))
      r[c] = snap.data().count
    } catch { r[c] = 0 }
  }))
  return r
}
