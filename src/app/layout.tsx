import type { Metadata } from 'next'

// These styles apply to every route in the application
import './globals.css'

export const metadata: Metadata = {
  title: 'AlphaOrbit',
  description: 'Your application description',
  icons: {
    icon: './AlphaOrbit.png',
    apple: './AlphaOrbit.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}