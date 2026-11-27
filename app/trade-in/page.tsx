// app/trade-in/page.tsx
// Static "coming soon" page. No server work, no API calls, no client logic.
import type { Metadata } from 'next'
import Link from 'next/link'
import AdSlot from '@/app/components/ads/AdSlot'
import JsonLd from '@/app/components/JsonLd'
import { ROUTES } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'
import { buildBreadcrumbList } from '@/lib/structuredData'
import { c, f } from '@/lib/tokens'

export const dynamic = 'force-static'

export const metadata: Metadata = buildMetadata({
  title: 'Phone Trade-In Estimator: Coming Soon',
  description:
    'The SpecMob trade-in estimator is being rebuilt to be more accurate and easier to use. It will be back soon. Meanwhile, browse specs and compare phones.',
  path: ROUTES.tradein,
  noindex: true,
})

const p = { fontSize: 16, lineHeight: 1.7, color: c.text2, margin: '0 0 14px' } as const
const h2 = { fontFamily: f.serif, fontSize: 22, color: c.text1, margin: '32px 0 12px' } as const

export default function TradeInPage() {
  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '48px var(--page-px) 80px' }}>
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Home', path: ROUTES.home },
          { name: 'Trade-in value', path: ROUTES.tradein },
        ])}
      />
      <div style={{ maxWidth: 680 }}>
        <h1 style={{ fontFamily: f.serif, fontSize: 36, color: c.text1, margin: '0 0 16px' }}>
          Trade-in estimator: improvements in progress
        </h1>
        <p style={p}>
          The SpecMob trade-in estimator is currently being improved. We are rebuilding it so the value
          ranges are more accurate, the questions are easier to answer, and the results are clearer. We will
          make it better and bring it back sooner rather than later.
        </p>

        <h2 style={h2}>What the estimator will do</h2>
        <p style={p}>
          You will describe your phone&apos;s screen, body and battery condition and any faults, and get an
          estimated trade-in range based on tracked market prices. It will be an estimate to help you
          decide, not a buyback offer from us.
        </p>

        <h2 style={h2}>Tips while you wait</h2>
        <p style={p}>
          A phone in good condition with its original box, charger and receipt usually sells for more.
          Back up your data, sign out of your accounts, and factory reset the phone before handing it over.
          Comparing offers from several buyers is almost always worth the few minutes it takes.
        </p>

        <h2 style={h2}>Meanwhile on SpecMob</h2>
        <p style={p}>
          You can still browse full phone specs, compare models side by side, and see our latest picks
          for every budget.
        </p>
        <Link
          href={ROUTES.home}
          style={{
            display: 'inline-block', padding: '12px 22px', background: c.text1, color: '#fff',
            borderRadius: 'var(--r-md)', textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}
        >
          Back to home
        </Link>
      </div>
      <AdSlot id="tradein-1" />
    </main>
  )
}
