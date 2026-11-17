import { SITE_URL } from '@/lib/config'
import { mainPaths } from '@/lib/sitemap-main'
import { serve } from '@/lib/sitemap-xml'

export const dynamic = 'force-dynamic'

export const GET = () =>
  serve(async () => {
    const base = SITE_URL.replace(/\/$/, '')
    return (await mainPaths()).map(path => ({ loc: `${base}${path}` }))
  })
