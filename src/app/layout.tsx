import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: "Loaves of Love – St. Anne's Episcopal Church",
  description:
    "Coordination platform for the Loaves of Love Ministry at St. Anne's Episcopal Church, Tifton, Georgia.",
  openGraph: {
    title: 'Loaves of Love',
    description:
      "Coordination platform for the Loaves of Love Ministry at St. Anne's Episcopal Church, Tifton, Georgia.",
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    siteName: 'Loaves of Love',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loaves of Love',
    description: 'Coordination platform for the Loaves of Love Ministry.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-amber-50 text-gray-900">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
