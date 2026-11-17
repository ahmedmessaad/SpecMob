import { SITE_URL } from '@/lib/config'
import { isDuplicateBrandPath } from '@/lib/dupes'
import { collect, respond, xml } from '@/lib/sitemap-xml'

export const dynamic = 'force-dynamic'

export async function GET() {
  let phones: Awaited<ReturnType<typeof collect>>
  try {
    phones = await collect('phones')
  } catch {
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '300', 'Cache-Control': 'no-store' },
    })
  }

  const seen = new Set<string>()

  for (const p of phones) {
    if (isDuplicateBrandPath(p.path)) {
      seen.add(p.path)
      continue
    }
    const m = p.path.match(/^\/brand\/([^/]+)\/([^/]+)\/?$/)
    if (!m) continue
    const [, brand, slug] = m
    const dupe = `/brand/${brand}/${brand}-${slug}`
    if (isDuplicateBrandPath(dupe)) seen.add(dupe)
  }

  return respond(xml([...seen].map(path => ({ loc: `${SITE_URL}${path}` }))))
}
