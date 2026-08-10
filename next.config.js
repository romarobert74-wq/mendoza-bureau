/** @type {import('next').NextConfig} */
const nextConfig = {
  // Inyecta el entorno en tiempo de build. En Vercel estas variables SIEMPRE
  // están disponibles al compilar (VERCEL_ENV, VERCEL_GIT_COMMIT_REF), aunque
  // no estén expuestas al navegador. Así el cartel de entorno funciona siempre.
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_BRANCH: process.env.VERCEL_GIT_COMMIT_REF || '',
  },
}

module.exports = nextConfig
