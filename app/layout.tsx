import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Anfloy Chat Widget',
  description: 'AI-powered chat widget for Anfloy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'transparent' }}>{children}</body>
    </html>
  )
}
