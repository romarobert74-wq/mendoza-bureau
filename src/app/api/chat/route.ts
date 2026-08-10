import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, increment } from 'firebase/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Firebase init (server-side, uses NEXT_PUBLIC_ vars which are available here)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
const app = getApps().find(a => a.name === 'chat-api') ?? initializeApp(firebaseConfig, 'chat-api')
const db = getFirestore(app)

const TONO_EXTRA: Record<string, string> = {
  amigable: 'Usá un tono cálido y cercano.',
  profesional: 'Usá un tono profesional y preciso.',
  entusiasta: 'Mostrá entusiasmo y energía positiva.',
  formal: 'Usá un tono formal y respetuoso.',
}

interface SocioResumen {
  nombre: string
  categoria: string
  descripcion?: string
  direccion?: string
  urlTour?: string
  whatsapp?: string
  web?: string
}

const PRECIO_INPUT_POR_MILLON = 1.0
const PRECIO_OUTPUT_POR_MILLON = 5.0

export async function POST(req: NextRequest) {
  try {
    const { mensajes, config, socios } = await req.json()

    if (!mensajes || !Array.isArray(mensajes)) {
      return NextResponse.json({ error: 'mensajes inválidos' }, { status: 400 })
    }

    const tonoExtra = TONO_EXTRA[config?.tono] ?? ''
    const admin = getAdminDb()

    let sociosContext = ''
    if (socios && Array.isArray(socios) && socios.length > 0) {
      const lineas = (socios as SocioResumen[]).map(s => {
        const parts = [`• ${s.nombre} (${s.categoria})`]
        if (s.descripcion) parts.push(`  Descripción: ${s.descripcion}`)
        if (s.direccion) parts.push(`  Dirección: ${s.direccion}`)
        if (s.urlTour) parts.push(`  🎥 Tour virtual: ${s.urlTour}`)
        if (s.whatsapp) parts.push(`  📱 WhatsApp: ${s.whatsapp}`)
        if (s.web) parts.push(`  🌐 Web: ${s.web}`)
        return parts.join('\n')
      })
      sociosContext = `\n\nSOCIOS ACTIVOS DE MENDOZA BUREAU:\n${lineas.join('\n\n')}`
    }

    // ── Base de conocimiento: leemos los documentos (PDF/texto) desde la config ──
    // Se hace server-side para no enviar el PDF de ida y vuelta al cliente.
    const bloquesDoc: Anthropic.ContentBlockParam[] = []
    let conocimientoTexto = ''
    try {
      let documentos: { nombre: string; contenido: string }[] | undefined
      if (admin) {
        const snap = await admin.collection('configuracion').doc('chatbot').get()
        documentos = snap.exists ? (snap.data()?.documentos as typeof documentos) : []
      } else {
        const cfgSnap = await getDoc(doc(db, 'configuracion', 'chatbot'))
        documentos = (cfgSnap.exists() ? cfgSnap.data().documentos : []) as typeof documentos
      }
      let presupuesto = 4_500_000 // ~4.5MB de base64 para no pasarnos del límite del request
      for (const d of documentos ?? []) {
        if (!d?.contenido) continue
        const esPdf = (d.nombre || '').toLowerCase().endsWith('.pdf')
        if (presupuesto - d.contenido.length < 0) break
        presupuesto -= d.contenido.length
        if (esPdf) {
          bloquesDoc.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: d.contenido },
            title: d.nombre,
          } as Anthropic.ContentBlockParam)
        } else {
          // documento de texto: viene en base64 → lo decodificamos
          try {
            const txt = Buffer.from(d.contenido, 'base64').toString('utf-8')
            conocimientoTexto += `\n\n### Documento: ${d.nombre}\n${txt}`
          } catch { /* ignorar documento ilegible */ }
        }
      }
    } catch (e) {
      console.warn('[chat] no se pudieron leer los documentos:', e)
    }

    const systemPrompt = [
      config?.promptSistema ?? '',
      tonoExtra,
      sociosContext,
      conocimientoTexto ? `\n\nBASE DE CONOCIMIENTO (documentos cargados):${conocimientoTexto}` : '',
      '\nUsá la información de los documentos adjuntos y la base de conocimiento para responder. Si la respuesta está en un documento, respondé con esos datos.',
      'Cuando el usuario pregunta por un socio, un tour, cómo contactarlo o su web, dale los datos concretos que tengas: link del tour, WhatsApp y web.',
      'Si no tenés el dato, decilo con claridad en vez de inventarlo.',
      'Respondé siempre en español.',
    ].filter(Boolean).join('\n')

    const primerUserIdx = mensajes.findIndex((m: { rol: string }) => m.rol === 'user')
    const messages = mensajes.map((m: { rol: string; contenido: string }, i: number) => {
      // Adjuntamos los documentos (PDF) al PRIMER mensaje del usuario
      if (i === primerUserIdx && bloquesDoc.length > 0) {
        return { role: 'user' as const, content: [...bloquesDoc, { type: 'text' as const, text: m.contenido }] }
      }
      return { role: m.rol as 'user' | 'assistant', content: m.contenido }
    })

    const response = await client.messages.create({
      model: config?.modelo ?? 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const respuesta =
      response.content[0]?.type === 'text' ? response.content[0].text : ''

    // Track usage — best effort, non-blocking
    try {
      const { input_tokens, output_tokens } = response.usage
      const costoUSD =
        (input_tokens / 1_000_000) * PRECIO_INPUT_POR_MILLON +
        (output_tokens / 1_000_000) * PRECIO_OUTPUT_POR_MILLON

      const mes = new Date().toISOString().slice(0, 7)

      if (admin) {
        await admin.collection('configuracion').doc('chatbot_uso').set({
          totalConsultas: FieldValue.increment(1),
          totalInputTokens: FieldValue.increment(input_tokens),
          totalOutputTokens: FieldValue.increment(output_tokens),
          totalCostoUSD: FieldValue.increment(costoUSD),
          ultimaConsulta: new Date().toISOString(),
          [`meses.${mes}.consultas`]: FieldValue.increment(1),
          [`meses.${mes}.costoUSD`]: FieldValue.increment(costoUSD),
        }, { merge: true })
      } else {
        await setDoc(
          doc(db, 'configuracion', 'chatbot_uso'),
          {
            totalConsultas: increment(1),
            totalInputTokens: increment(input_tokens),
            totalOutputTokens: increment(output_tokens),
            totalCostoUSD: increment(costoUSD),
            ultimaConsulta: new Date().toISOString(),
            [`meses.${mes}.consultas`]: increment(1),
            [`meses.${mes}.costoUSD`]: increment(costoUSD),
          },
          { merge: true },
        )
      }
    } catch (usageErr) {
      console.warn('[chat] usage tracking failed:', usageErr)
    }

    return NextResponse.json({ respuesta })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
