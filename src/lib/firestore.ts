import {
  collection,
  doc,
  getDoc,
  getDocs,
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
  }
}

export async function setConfigSistema(data: ConfigSistema) {
  await setDoc(doc(db, 'configuracion', 'sistema'), {
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
}

const EVENTO_VACIO = (): AnalyticsSocio => ({
  tour: 0, contacto: 0, web: 0, redes: 0, visitas: 0, tiempoMs: 0,
})

export async function getAnalyticsResumen(): Promise<AnalyticsResumen> {
  const snap = await getDocs(collection(db, 'analytics'))
  const porSocio: Record<string, AnalyticsSocio> = {}
  const total = EVENTO_VACIO()

  snap.docs.forEach(d => {
    const { socioId, tipo, ms } = d.data() as { socioId?: string; tipo?: string; ms?: number }
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
    }
  })

  return { porSocio, total }
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
