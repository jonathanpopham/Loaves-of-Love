import Image from 'next/image'

interface GalleryImage {
  src: string
  alt: string
  width: number
  height: number
}

interface GalleryProps {
  images: GalleryImage[]
  title?: string
}

export function Gallery({ images, title }: GalleryProps) {
  return (
    <section className="py-8">
      {title && (
        <h2 className="text-2xl font-bold text-amber-900 mb-6">{title}</h2>
      )}
      {images.length === 0 ? (
        <p className="text-gray-500 italic">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
