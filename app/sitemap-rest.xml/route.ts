import { ROUTES, SITE_URL } from '@/lib/config'
import { isDuplicateBrandPath } from '@/lib/dupes'
import { mainPaths } from '@/lib/sitemap-main'
import { collect, serve } from '@/lib/sitemap-xml'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = [ROUTES.contact, ROUTES.fund, ROUTES.privacy, ROUTES.terms]

export const GET = () =>
  serve(async () => {
    const [main, phones, brands, compares] = await Promise.all([
      mainPaths(),
      collect('phones'),
      collect('brands'),
      collect('compares'),
    ])

    const inMain = new Set(main)
    const paths = new Set<string>(STATIC_PATHS.filter(path => !inMain.has(path)))
    for (const e of [...phones, ...brands, ...compares]) {
      if (!inMain.has(e.path) && !isDuplicateBrandPath(e.path)) paths.add(e.path)
    }

    const base = SITE_URL.replace(/\/$/, '')
    return [...paths].map(path => ({ loc: `${base}${path}` }))
  })
