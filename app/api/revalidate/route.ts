import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { LISTS_TAG } from '@/lib/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = new Set([LISTS_TAG])

function authorized(header: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || !header) return false
  const a = Buffer.from(header)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get('x-revalidate-secret'))) {
    return new Response('Unauthorized', { status: 401 })
  }

  let tags: string[] = [LISTS_TAG]
  try {
    const body = (await request.json()) as { tags?: unknown }
    if (Array.isArray(body.tags)) tags = body.tags.filter((t): t is string => typeof t === 'string')
  } catch {}

  const accepted = tags.filter(t => ALLOWED.has(t))
  for (const tag of accepted) revalidateTag(tag)
  return Response.json({ revalidated: accepted })
}
