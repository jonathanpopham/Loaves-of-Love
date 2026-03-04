import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#8B1A1A',
}

export const metadata: Metadata = {
  title: "Loaves of Love — St. Anne's Episcopal Church",
  description:
    "Loaves of Love is a baking ministry at St. Anne's Episcopal Church in Tifton, Georgia, providing homemade bread to those in need.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://loaves-of-love.vercel.app'
  ),
  openGraph: {
    type: 'website',
    siteName: 'Loaves of Love',
    title: "Loaves of Love — St. Anne's Episcopal Church",
    description:
      'A baking ministry providing homemade bread to those in need in Tifton, Georgia.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Loaves of Love — St. Anne's Episcopal Church",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loaves of Love',
    description:
      'A baking ministry providing homemade bread to those in need in Tifton, Georgia.',
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      {
        url: '/images/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/images/favicon-32x32.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-lol-cream">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
