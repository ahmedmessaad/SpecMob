// app/compare/page.tsx
import CompareClient, { type PairCard } from '@/app/components/compare/CompareClient'
import JsonLd from '@/app/components/JsonLd'
import { api } from '@/lib/api'
import { ROUTES } from '@/lib/config'
import { buildBreadcrumbList, buildItemList } from '@/lib/structuredData'
import type { CompareLandingResponse } from '@/lib/types'

export const revalidate = 900

async function getLanding(): Promise<CompareLandingResponse | null> {
  try {
    return await api.discover.compareLanding()
  } catch {
    return null
  }
}

export default async function ComparePage() {
  const landing = await getLanding()

  const suggested: PairCard[] = (landing?.most_compared ?? []).map(p => ({ path: p.path, phones: p.phones }))
  const matchups: PairCard[] = (landing?.category_matchups ?? [])
    .filter(m => m.phones.length >= 2)
    .map(m => {
      const top = m.phones.slice(0, 2)
      return { path: ROUTES.comparePair(...top.map(p => p.full_slug)), phones: top, label: m.category.title }
    })

  const groups = (landing?.category_groups ?? []).filter(g => g.phones.length >= 3)
  const toCard = (g: (typeof groups)[number], size: 3 | 4): PairCard => {
    const phones = g.phones.slice(0, size)
    return { path: ROUTES.comparePair(...phones.map(p => p.full_slug)), phones, label: g.category.title }
  }
  const trios: PairCard[] = groups.slice(0, 6).map(g => toCard(g, 3))
  const quads: PairCard[] = groups.filter(g => g.phones.length >= 4).slice(0, 4).map(g => toCard(g, 4))

  return (
    <>
      <JsonLd data={buildBreadcrumbList([{ name: 'Home', path: ROUTES.home }, { name: 'Compare', path: ROUTES.compare }])} />
      <JsonLd data={suggested.length ? buildItemList('Most compared phones', suggested.map(s => ({ path: s.path, name: s.phones.map(p => p.display_name).join(' vs ') }))) : null} />
      <CompareClient initialPhones={[]} suggested={suggested} matchups={matchups} trios={trios} quads={quads} nextSteps={landing?.next_steps ?? []} />
    </>
  )
}
