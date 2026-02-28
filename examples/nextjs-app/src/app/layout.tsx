import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NaturalLink Demo App',
  description: 'Example app for demonstrating regression checks'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
