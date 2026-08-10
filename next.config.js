/** @type {import('next').NextConfig} */

// Cabeceras de seguridad seguras para todo el sitio.
const cabecerasBase = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },          // evita "MIME sniffing"
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
]
// El panel y el login NO deben poder embeberse en un iframe (anti-clickjacking).
// El tour y la web institucional SÍ se embeben (3DVista), por eso no llevan esta cabecera.
const antiIframe = { key: 'X-Frame-Options', value: 'DENY' }

const nextConfig = {
  // Inyecta el entorno en tiempo de build. En Vercel estas variables SIEMPRE
  // están disponibles al compilar (VERCEL_ENV, VERCEL_GIT_COMMIT_REF), aunque
  // no estén expuestas al navegador. Así el cartel de entorno funciona siempre.
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_BRANCH: process.env.VERCEL_GIT_COMMIT_REF || '',
  },

  async headers() {
    return [
      { source: '/:path*', headers: cabecerasBase },
      { source: '/dashboard/:path*', headers: [...cabecerasBase, antiIframe] },
      { source: '/login', headers: [...cabecerasBase, antiIframe] },
    ]
  },
}

module.exports = nextConfig
