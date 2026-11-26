// app/methodology/page.tsx
import type { Metadata } from 'next'
import { ROUTES } from '@/lib/config'
import { api } from '@/lib/api'
import { buildMetadata } from '@/lib/seo'
import CompanyShell from '@/app/components/company/CompanyShell'
import { Section, P, Rows, Row } from '@/app/components/company/Prose'
import type { CategoryListItem } from '@/lib/types'

export const revalidate = 86400

export const metadata: Metadata = buildMetadata({
  title: 'How We Score Phones: Smart Score and Ranking Methods',
  description:
    'How the Specmob Smart Score is built from six components, why scores are rated within a price tier, and how each best-of ranking is calculated.',
  path: ROUTES.methodology,
})

const TOC = [
  { id: 'smart-score', label: 'The Smart Score' },
  { id: 'rankings', label: 'Best-of rankings' },
  { id: 'prices', label: 'Prices' },
] as const

const COMPONENTS = [
  ['Camera', 'Main sensor, stabilization, ultrawide, telephoto and zoom, and video capability.'],
  ['Performance', 'Chipset class and memory, plus benchmark results where they are listed.'],
  ['Battery', 'Capacity relative to the device, wired and wireless charging speed.'],
  ['Display', 'Panel type, refresh rate, resolution, brightness and size.'],
  ['Build', 'Materials, water and dust resistance, and durability technology.'],
  ['Value', 'What the hardware delivers for the listed price in its tier.'],
] as const

async function getCategories(): Promise<CategoryListItem[]> {
  try {
    return (await api.categories.list()).categories
  } catch {
    return []
  }
}

export default async function MethodologyPage() {
  const categories = await getCategories()

  return (
    <CompanyShell
      current="methodology"
      title="How we score"
      toc={TOC}
      lede={
        <p>
          Every score and ranking on Specmob is built from listed specifications. Specs come from public manufacturer listings
          and established phone databases, an AI model rates each phone&apos;s specs on the six components below, and the best-of
          rankings are then computed from those specs and scores with fixed formulas. We do not run hands-on tests, we do not
          accept payment for placement, and every brand is scored by the same rules.
        </p>
      }
    >
      <Section id="smart-score" title="The Smart Score">
        <P>
          The overall Smart Score is the average of six component scores, each from 1 to 10. Each component is rated against the
          phone&apos;s market tier (budget, mid-range, upper mid-range, flagship or ultra flagship), so a score describes quality
          within a tier, not across the whole market. That is why Specmob shows the tier next to a score.
        </P>
        <Rows>
          {COMPONENTS.map(([name, text]) => <Row key={name} title={name} text={text} />)}
        </Rows>
        <P>
          Scoring never invents specifications. When a value is not listed, such as a benchmark result, it is treated as unknown
          and the written analysis says so.
        </P>
      </Section>

      <Section id="rankings" title="Best-of rankings">
        <P>
          Each ranking uses its own formula and a limit on phones per brand, so one manufacturer cannot fill a whole list.
          Regional editions are excluded.
        </P>
        <Rows>
          {categories.map(cat => <Row key={cat.slug} title={cat.title} text={cat.description} href={cat.path} />)}
        </Rows>
        <P><a href={ROUTES.best}>Browse all rankings</a></P>
      </Section>

      <Section id="prices" title="Prices">
        <P>
          Prices are shown in US dollars. The price on a phone page is the lowest recorded price across its storage
          configurations. Buy buttons appear only when a retailer offer exists, and some retail links are affiliate links (see our{' '}
          <a href={`${ROUTES.terms}#affiliate`}>affiliate disclosure</a>). Affiliate relationships never change a ranking.
        </P>
        <P>
          Spotted something that looks wrong? <a href={ROUTES.contact}>Tell us</a>. Who pays for all this? See{' '}
          <a href={ROUTES.fund}>Fund Specmob</a> and <a href={ROUTES.about}>About Specmob</a>.
        </P>
      </Section>
    </CompanyShell>
  )
}
