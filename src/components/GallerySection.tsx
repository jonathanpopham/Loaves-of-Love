import Image from "next/image";

const GALLERY_IMAGES = [
  { src: "/images/gallery/baking-01.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-02.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-03.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-04.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-05.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-06.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-07.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-08.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-09.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-10.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-11.jpg", alt: "Ministry baking activity" },
  { src: "/images/gallery/baking-12.jpg", alt: "Ministry baking activity" },
];

export default function GallerySection() {
  return (
    <section aria-label="Ministry gallery">
      <h2 className="text-2xl font-bold text-lol-red mb-6">Ministry in Action</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {GALLERY_IMAGES.map((image, index) => (
          <div
            key={image.src}
            className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority={index < 4}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
