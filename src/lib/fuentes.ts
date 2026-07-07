// ─────────────────────────────────────────────────────────────
//  Lectura de fuentes externas para alimentar al Estratega
// ─────────────────────────────────────────────────────────────

// Baja una URL y la reduce a texto plano (para pasarle contexto de
// competencia / redes sociales al modelo).
export async function leerUrlTexto(url: string, maxChars = 3500): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MendozaBureauBot/1.0)' },
    })
    clearTimeout(timeout)
    if (!res.ok) return `(No se pudo leer ${url}: HTTP ${res.status})`

    const html = await res.text()
    const texto = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()

    return texto.slice(0, maxChars)
  } catch {
    return `(No se pudo leer ${url})`
  }
}

// Lee varias URLs en paralelo y las arma en un bloque de contexto.
export async function leerFuentes(urls: string[]): Promise<string> {
  const validas = urls.map(u => u.trim()).filter(Boolean).slice(0, 4)
  if (validas.length === 0) return ''
  const textos = await Promise.all(
    validas.map(async u => `▸ FUENTE: ${u}\n${await leerUrlTexto(u)}`),
  )
  return textos.join('\n\n')
}
