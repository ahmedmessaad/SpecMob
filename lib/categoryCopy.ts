import type { CategoryDetail, CategoryPhone } from './types'

interface CategoryCopy {
  lead: string
  topic: string
  basis: string
  head: string
  qualifier?: string
}

const COPY: Record<string, CategoryCopy> = {
  'camera-phones': {
    lead: 'Best camera phones',
    topic: 'best camera phone',
    basis: 'camera hardware',
    head: 'Best Camera Phones {y}: Top {n} by Camera Specs',
  },
  'battery-life': {
    lead: 'Longest battery life phones',
    topic: 'phone with the longest battery life',
    basis: 'estimated screen-on hours',
    head: 'Longest Battery Life Phones {y}: Top {n} Ranked',
    qualifier: 'Hours are estimates from battery capacity and display size, not lab tests.',
  },
  'gaming-phones': {
    lead: 'Best gaming phones',
    topic: 'best gaming phone',
    basis: 'gaming performance',
    head: 'Best Gaming Phones {y}: Top {n} by Performance',
  },
  'fast-charging': {
    lead: 'Fastest charging phones',
    topic: 'fastest-charging phone',
    basis: 'estimated charging speed',
    head: 'Fastest Charging Phones {y}: Ranked by Speed',
    qualifier: 'Wired charging of 45W or more.',
  },
  lightweight: {
    lead: 'Lightest smartphones',
    topic: 'lightest smartphone',
    basis: 'weight',
    head: 'Lightest Smartphones {y}: Ranked by Weight in g',
    qualifier: 'Modern phones with 5.5in+ screens.',
  },
  'compact-phones': {
    lead: 'Best compact phones',
    topic: 'best compact phone',
    basis: 'size and quality',
    head: 'Best Compact Phones {y}: Top {n} Ranked',
    qualifier: 'Screens from 5.0 to 6.3in.',
  },
  foldables: {
    lead: 'Best foldable phones',
    topic: 'best foldable phone',
    basis: 'overall score',
    head: 'Best Foldable Phones {y}: Top {n} Ranked',
  },
  'water-resistant': {
    lead: 'Best water-resistant phones',
    topic: 'best water-resistant phone',
    basis: 'overall score',
    head: 'Best Water-Resistant Phones {y}: Top {n}',
    qualifier: 'IP67 or better.',
  },
  'under-300': {
    lead: 'Best phones under $300',
    topic: 'best phone under $300',
    basis: 'performance, battery, display and build',
    head: 'Best Phones Under $300 ({y}): Top {n} Ranked',
  },
  'under-500': {
    lead: 'Best phones under $500',
    topic: 'best phone under $500',
    basis: 'performance, battery, display and build',
    head: 'Best Phones Under $500 ({y}): Top {n} Ranked',
  },
  'under-700': {
    lead: 'Best phones under $700',
    topic: 'best phone under $700',
    basis: 'performance, battery, display and build',
    head: 'Best Phones Under $700 ({y}): Top {n} Ranked',
  },
}

const TITLE_BUDGET = 50
const DESCRIPTION_BUDGET = 158

const firstFit = (candidates: string[], budget: number): string =>
  candidates.find(c => c.length <= budget) ?? candidates[candidates.length - 1]

const copyFor = (data: CategoryDetail): CategoryCopy =>
  COPY[data.slug] ?? { lead: data.title, topic: '', basis: 'our scoring', head: `${data.title} {y}` }

const labelled = (p: CategoryPhone): string =>
  p.metric ? `${p.display_name} (${p.metric})` : p.display_name

export function categoryHeading(data: CategoryDetail, year: number): string {
  return data.slug.startsWith('under-') ? `${data.title} (${year})` : `${data.title} ${year}`
}

export function categoryTitle(data: CategoryDetail, year: number): string {
  const n = Math.min(data.phones.length, 10)
  const head = copyFor(data).head.replace('{y}', String(year)).replace('{n}', String(n))
  if (n >= 3 && head.length <= TITLE_BUDGET) return head
  return firstFit([`${data.title} (${year}): Top ${n} Ranked`, `${data.title} (${year})`], TITLE_BUDGET)
}

export function categoryLede(data: CategoryDetail): string {
  const top = data.phones.slice(0, 3)
  if (!top.length) return ''
  const { topic, basis, qualifier } = copyFor(data)
  const [first, second, third] = top
  const head = topic
    ? `${labelled(first)} is the ${topic} right now`
    : `${labelled(first)} is #1 in our ${data.title} ranking`
  const tail = third
    ? `, followed by ${labelled(second)} and ${labelled(third)}`
    : second ? `, followed by ${labelled(second)}` : ''
  return `${head}${tail}. All ${data.phones.length} phones are ranked on ${basis}.${qualifier ? ` ${qualifier}` : ''}`
}

export function categoryDescription(data: CategoryDetail, year: number): string {
  const top = data.phones.slice(0, 3)
  const n = data.phones.length
  const { lead, basis, qualifier } = copyFor(data)
  if (!top.length) return `${data.title}: ranked on specifications, never on sponsors.`

  const withMetric = top.map(labelled)
  const plain = top.map(p => p.display_name)
  const q = qualifier ? ` ${qualifier}` : ''
  const tail = `Ranked on ${basis}, never on sponsors.`
  const list = (names: string[]) => names.join(', ')

  return firstFit(
    [
      `${lead} ${year}: ${list(withMetric)}.${q} ${tail}`,
      `${lead} ${year}: ${list(withMetric)}.${q}`,
      `${lead} ${year}: ${list(plain)}. ${tail}`,
      `${lead} ${year}: ${list(plain)}. See all ${n} ranked.`,
      `${lead} ${year}: ${plain[0]}. See all ${n} ranked.`,
    ],
    DESCRIPTION_BUDGET,
  )
}
