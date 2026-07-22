import { NextResponse } from 'next/server'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Endpoint LIVIANO para el menú del tour ("Descubrí la zona").
// Devuelve solo los campos que la lista necesita (texto), SIN la fotoPortada
// en base64 ni el bloque de contacto, que son lo que hace pesada la carga.
// Se cachea en el edge de Vercel para que las visitas repetidas sean instantáneas.
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
        razonSocial: data.razonSocial || '',
        etiqueta: data.etiqueta || '',
        categoria: data.categoria || '',
        direccion: data.direccion || '',
        // texto completo: lo usa el bot para responder (el menú lo recorta al mostrar)
        infoGeneral: data.infoGeneral || '',
        contacto: data.contacto || null,
        urlInternaTour: data.urlInternaTour || '',
        urlInternaVuelta: data.urlInternaVuelta || '',
      }
    })
    return NextResponse.json(socios, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        // caché en el CDN: 60s fresco + 5 min sirviendo mientras revalida
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al obtener socios' }, { status: 500 })
  }
}
