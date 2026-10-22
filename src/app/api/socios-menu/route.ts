import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getAdminDb } from '@/lib/firebaseAdmin'

// Endpoint LIVIANO para el menú del tour ("Descubrí la zona").
// Devuelve solo los campos de texto que la lista necesita.
//
// IMPORTANTE: con el Admin SDK usamos .select(...) para que Firestore envíe
// ÚNICAMENTE estos campos y NO las fotos en base64 (fotoPortada/logoUrl), que
// son lo que hacía lenta la carga. Antes se descargaba el documento completo y
// recién después se descartaba lo pesado. Si no hay Admin SDK, cae al cliente.
const CAMPOS = ['razonSocial', 'etiqueta', 'categoria', 'direccion', 'infoGeneral', 'contacto', 'urlInternaTour', 'urlInternaVuelta', 'activo']

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  // caché en el CDN de Vercel: 2 min fresco + 10 min sirviendo mientras revalida
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
}

export async function GET() {
  try {
    const admin = getAdminDb()
    if (admin) {
      const snap = await admin.collection('socios').orderBy('razonSocial', 'asc').select(...CAMPOS).get()
      const socios = snap.docs
        .filter(d => d.get('activo') !== false)
        .map(d => ({
          id: d.id,
          razonSocial: d.get('razonSocial') || '',
          etiqueta: d.get('etiqueta') || '',
          categoria: d.get('categoria') || '',
          direccion: d.get('direccion') || '',
          infoGeneral: d.get('infoGeneral') || '',
          contacto: d.get('contacto') || null,
          urlInternaTour: d.get('urlInternaTour') || '',
          urlInternaVuelta: d.get('urlInternaVuelta') || '',
        }))
      return NextResponse.json(socios, { headers: HEADERS })
    }

    // Fallback: client SDK (import diferido para no iniciar Firebase en el build).
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    const q = query(collection(db, 'socios'), orderBy('razonSocial', 'asc'))
    const snap = await getDocs(q)
    const socios = snap.docs
      .filter(d => d.data().activo !== false)
      .map(d => {
        const data = d.data()
        return {
          id: d.id,
          razonSocial: data.razonSocial || '',
          etiqueta: data.etiqueta || '',
          categoria: data.categoria || '',
          direccion: data.direccion || '',
          infoGeneral: data.infoGeneral || '',
          contacto: data.contacto || null,
          urlInternaTour: data.urlInternaTour || '',
          urlInternaVuelta: data.urlInternaVuelta || '',
        }
      })
    return NextResponse.json(socios, { headers: HEADERS })
  } catch (err) {
    console.error('[socios-menu]', err)
    return NextResponse.json({ error: 'Error al obtener socios' }, { status: 500 })
  }
}
