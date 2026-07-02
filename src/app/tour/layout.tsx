'use client'

import { useEffect } from 'react'

export default function TourLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Mark as tour frame so globals.css doesn't force dark background
    document.documentElement.setAttribute('data-tour', 'true')
    document.documentElement.style.background = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
    document.body.style.background = 'transparent'
    document.body.style.backgroundColor = 'transparent'
    return () => {
      document.documentElement.removeAttribute('data-tour')
    }
  }, [])

  return <>{children}</>
}
