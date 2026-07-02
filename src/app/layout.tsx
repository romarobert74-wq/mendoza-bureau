import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mendoza Bureau | Panel de Administración',
  description: 'Plataforma de gestión de tours virtuales Mendoza Bureau',
}

// Aplica el tema guardado ANTES de pintar (evita el parpadeo blanco)
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('mb-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e){ document.documentElement.setAttribute('data-theme','dark'); }
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
