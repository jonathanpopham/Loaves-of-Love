'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/announcements', label: 'Announcements' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-brand-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white font-bold text-lg">
            🍞 Loaves of Love
          </Link>
          <div className="hidden sm:flex sm:space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-brand-900 text-white'
                    : 'text-brand-100 hover:bg-brand-600 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
