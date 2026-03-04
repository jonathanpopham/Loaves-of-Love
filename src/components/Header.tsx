import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-amber-200 py-4 px-6">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Loaves of Love"
            width={200}
            height={50}
            priority
          />
        </Link>
      </nav>
    </header>
  )
}
