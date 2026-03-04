import { Gallery } from '@/components/Gallery'

const galleryImages: Array<{ src: string; alt: string; width: number; height: number }> = []

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-2">Loaves of Love Ministry</h1>
      <p className="text-gray-600 mb-8">St. Anne&apos;s Episcopal Church, Tifton, Georgia</p>
      <Gallery images={galleryImages} title="Our Ministry" />
    </div>
  )
}
