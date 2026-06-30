import { NextResponse } from 'next/server'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    const q = query(
      collection(db, 'socios'),
      where('activo', '==', true),
      orderBy('razonSocial', 'asc')
    )
    const snap = await getDocs(q)
    const socios = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        razonSocial: data.razonSocial,
        etiqueta: data.etiqueta,
        categoria: data.categoria,
        direccion: data.direccion,
        infoGeneral: data.infoGeneral,
        fotoPortada: data.fotoPortada,
        contacto: data.contacto,
        urlInternaTour: data.urlInternaTour,
        urlInternaVuelta: data.urlInternaVuelta,
      }
    })
    return NextResponse.json(socios, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al obtener socios' }, { status: 500 })
  }
}
