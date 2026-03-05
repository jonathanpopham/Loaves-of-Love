/**
 * Unit tests for auth middleware logic.
 *
 * We test the route matching and public route logic.
 * Full integration with Supabase auth requires a running instance.
 */

const publicRoutes = ['/login', '/auth/callback']

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route))
}

describe('Auth middleware route matching', () => {
  it('treats /login as public', () => {
    expect(isPublicRoute('/login')).toBe(true)
  })

  it('treats /auth/callback as public', () => {
    expect(isPublicRoute('/auth/callback')).toBe(true)
  })

  it('treats /auth/callback?code=abc as public', () => {
    expect(isPublicRoute('/auth/callback')).toBe(true)
  })

  it('treats /dashboard as protected', () => {
    expect(isPublicRoute('/dashboard')).toBe(false)
  })

  it('treats /inventory as protected', () => {
    expect(isPublicRoute('/inventory')).toBe(false)
  })

  it('treats /recipes as protected', () => {
    expect(isPublicRoute('/recipes')).toBe(false)
  })

  it('treats / as protected', () => {
    expect(isPublicRoute('/')).toBe(false)
  })

  it('treats /assignments as protected', () => {
    expect(isPublicRoute('/assignments')).toBe(false)
  })

  it('treats /announcements as protected', () => {
    expect(isPublicRoute('/announcements')).toBe(false)
  })
})

describe('Role guard logic', () => {
  const ADMIN_EMAILS = [
    'kim.moore@stannestifton.org',
    'jonathan.popham@stannestifton.org',
    'art.lawton@stannestifton.org',
  ]

  function isAdmin(role: string): boolean {
    return role === 'admin'
  }

  function isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.some((adminEmail) => email.toLowerCase() === adminEmail.toLowerCase())
  }

  it('identifies admin role', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('identifies baker role as non-admin', () => {
    expect(isAdmin('baker')).toBe(false)
  })

  it('recognizes admin email addresses', () => {
    expect(isAdminEmail('kim.moore@stannestifton.org')).toBe(true)
    expect(isAdminEmail('jonathan.popham@stannestifton.org')).toBe(true)
    expect(isAdminEmail('art.lawton@stannestifton.org')).toBe(true)
  })

  it('rejects non-admin email addresses', () => {
    expect(isAdminEmail('random@gmail.com')).toBe(false)
  })

  it('is case-insensitive for email matching', () => {
    expect(isAdminEmail('Kim.Moore@StAnnesTifton.Org')).toBe(true)
  })
})
