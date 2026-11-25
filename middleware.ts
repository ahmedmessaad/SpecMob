import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isDuplicateBrandPath } from '@/lib/dupes'

const PERMANENT = 308
const SLUG = /^[a-z0-9][a-z0-9._+-]*$/
const MAX_SLUG_LEN = 100
const MAX_COMPARE_PHONES = 4
const PAIR_SEPARATOR = '-vs-'

function notFound() {
  return new NextResponse('Not found', {
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, s-maxage=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

const validSlug = (s: string) => s.length <= MAX_SLUG_LEN && SLUG.test(s)

// Rejects malformed phone URLs and redirects non-canonical compare orderings at
// the edge, so neither starts a server render or an API call.
function gate(pathname: string, request: NextRequest): NextResponse | null {
  const brand = pathname.match(/^\/brand\/([^/]+)\/([^/]+)\/?$/)
  if (brand) return validSlug(brand[1]) && validSlug(brand[2]) ? null : notFound()

  const compare = pathname.match(/^\/compare\/([^/]+)\/?$/)
  if (!compare) return null

  let raw: string
  try {
    raw = decodeURIComponent(compare[1])
  } catch {
    return notFound()
  }
  const parts = raw.toLowerCase().split(PAIR_SEPARATOR).map(p => p.trim()).filter(Boolean)
  if (parts.length > MAX_COMPARE_PHONES || !parts.every(validSlug)) return notFound()

  if (parts.length >= 2 && new Set(parts).size === parts.length) {
    const canonical = [...parts].sort().join(PAIR_SEPARATOR)
    if (canonical !== raw) return NextResponse.redirect(new URL(`/compare/${canonical}`, request.url), PERMANENT)
  }
  return null
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Kill duplicate-brand URLs: no redirect, just gone.
  if (isDuplicateBrandPath(pathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  const gated = gate(pathname, request)
  if (gated) return gated

  if (pathname === '/') {
    const compare = searchParams.get('compare')
    if (compare) {
      return NextResponse.redirect(new URL(`/compare/${compare}`, request.url), PERMANENT)
    }

    const q = searchParams.get('q')
    if (q) {
      return NextResponse.redirect(new URL(`/search?q=${encodeURIComponent(q)}`, request.url), PERMANENT)
    }

    const brand = searchParams.get('brand')
    if (brand) {
      const slug = brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      if (slug) {
        const target = new URL(`/brand/${slug}`, request.url)
        const page = searchParams.get('page')
        if (page && /^\d+$/.test(page) && page !== '1') target.searchParams.set('page', page)
        return NextResponse.redirect(target, PERMANENT)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
}
