import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import SuggestImprovement from '@/components/SuggestImprovement'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Loaves of Love',
  description:
    "Coordination platform for the Loaves of Love Ministry at St. Anne's Episcopal Church",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
          <SuggestImprovement />
        </div>
      </body>
    </html>
  )
}
