// ─────────────────────────────────────────────────────────────
//  Cliente de Canva Connect API (server-side)
//  Autofill de una plantilla de marca + export a PNG.
//  Docs: https://www.canva.dev/docs/connect/
// ─────────────────────────────────────────────────────────────

const API = 'https://api.canva.com/rest/v1'

export interface CanvaCred {
  token: string
  brandTemplateId?: string
}

// data: mapa campo → texto, según los campos de la plantilla de marca
export interface AutofillData {
  [campo: string]: string
}

export interface CanvaResultado {
  designId: string
  editUrl?: string
  imagenUrl?: string   // PNG exportado
}

async function canvaError(res: Response): Promise<never> {
  let msg = `Canva API ${res.status}`
  try {
    const body = await res.json()
    if (body?.message) msg = `Canva: ${body.message}`
  } catch { /* ignore */ }
  throw new Error(msg)
}

async function post(path: string, body: unknown, token: string) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) await canvaError(res)
  return res.json()
}

async function get(path: string, token: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) await canvaError(res)
  return res.json()
}

// Espera a que un job asíncrono termine (autofill / export)
async function esperarJob(
  path: string,
  token: string,
  leerEstado: (data: unknown) => { status: string; ok: boolean; result?: unknown },
  maxIntentos = 20,
): Promise<unknown> {
  for (let i = 0; i < maxIntentos; i++) {
    const data = await get(path, token)
    const { status, ok, result } = leerEstado(data)
    if (status === 'success' && ok) return result
    if (status === 'failed') throw new Error('Canva: el trabajo falló')
    await new Promise(r => setTimeout(r, 1500))
  }
  throw new Error('Canva: tiempo de espera agotado')
}

// ── Autofill: rellena una plantilla de marca con los textos ─
export async function autofillPlantilla(
  cred: CanvaCred,
  data: AutofillData,
): Promise<string> {
  if (!cred.brandTemplateId) throw new Error('Falta el Brand Template ID de Canva')

  // El formato de data de autofill: { campo: { type: 'text', text: '...' } }
  const dataFields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    dataFields[k] = { type: 'text', text: v }
  }

  const job = await post('/autofills', {
    brand_template_id: cred.brandTemplateId,
    data: dataFields,
  }, cred.token)

  const jobId = job?.job?.id
  if (!jobId) throw new Error('Canva: no se pudo iniciar el autofill')

  const result = await esperarJob(`/autofills/${jobId}`, cred.token, (d) => {
    const j = (d as { job?: { status: string; result?: { design?: { id: string } } } }).job
    return {
      status: j?.status ?? 'in_progress',
      ok: !!j?.result?.design?.id,
      result: j?.result?.design?.id,
    }
  })
  return result as string
}

// ── Export: convierte un design a PNG y devuelve la URL ─────
export async function exportarPNG(cred: CanvaCred, designId: string): Promise<string> {
  const job = await post('/exports', {
    design_id: designId,
    format: { type: 'png' },
  }, cred.token)

  const jobId = job?.job?.id
  if (!jobId) throw new Error('Canva: no se pudo iniciar el export')

  const result = await esperarJob(`/exports/${jobId}`, cred.token, (d) => {
    const j = (d as { job?: { status: string; urls?: string[] } }).job
    return {
      status: j?.status ?? 'in_progress',
      ok: !!(j?.urls && j.urls.length > 0),
      result: j?.urls?.[0],
    }
  })
  return result as string
}

// ── Flujo completo: autofill + export ──────────────────────
export async function generarCreativo(
  cred: CanvaCred,
  data: AutofillData,
): Promise<CanvaResultado> {
  const designId = await autofillPlantilla(cred, data)
  const imagenUrl = await exportarPNG(cred, designId)
  return {
    designId,
    editUrl: `https://www.canva.com/design/${designId}/edit`,
    imagenUrl,
  }
}
