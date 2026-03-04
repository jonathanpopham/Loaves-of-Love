import GallerySection from "@/components/GallerySection";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-lol-red mb-4">
          Loaves of Love
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          A baking ministry at St. Anne&apos;s Episcopal Church in Tifton,
          Georgia — sharing homemade bread and God&apos;s love with those in
          need.
        </p>
      </section>
      <GallerySection />
    </div>
  );
}
