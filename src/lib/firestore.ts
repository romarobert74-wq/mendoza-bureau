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

// ── Analytics ────────────────────────────────────────────

export async function registrarClick(socioId: string, tipo: string) {
  await addDoc(collection(db, 'analytics'), {
    socioId,
    tipo,
    timestamp: serverTimestamp(),
  })
}
