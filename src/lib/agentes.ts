import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Agente, AgenteFormData } from '@/types/agentes'

// ── Agentes (colección Firestore) ─────────────────────────

export async function getAgentes(): Promise<Agente[]> {
  const q = query(collection(db, 'agentes'), orderBy('creadoEn', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Agente)
}

export async function getAgente(id: string): Promise<Agente | null> {
  const snap = await getDoc(doc(db, 'agentes', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Agente
}

export async function crearAgente(data: AgenteFormData): Promise<string> {
  const ref = await addDoc(collection(db, 'agentes'), {
    ...data,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function actualizarAgente(id: string, data: Partial<AgenteFormData>) {
  await updateDoc(doc(db, 'agentes', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

export async function eliminarAgente(id: string) {
  await deleteDoc(doc(db, 'agentes', id))
}
