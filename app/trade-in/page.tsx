// app/trade-in/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import AdSlot from '@/app/components/ads/AdSlot'
import { ROUTES } from '@/lib/config'
import { noindexMetadata } from '@/lib/seo'
import { c, f } from '@/lib/tokens'

export const metadata: Metadata = noindexMetadata(ROUTES.tradein, 'Trade-in estimator: coming soon')

export default function TradeInPage() {
  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '48px var(--page-px) 80px' }}>
      <div style={{ maxWidth: 640 }}>
        <h1 style={{ fontFamily: f.serif, fontSize: 36, color: c.text1, margin: '0 0 16px' }}>
          Trade-in estimator is getting an upgrade
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: c.text2, margin: '0 0 14px' }}>
          We are rebuilding the trade-in estimator to make it more accurate and easier to use. It is not
          available right now, but we are working on it and it will be back soon.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: c.text2, margin: '0 0 24px' }}>
          In the meantime, you can still browse phone specs, compare models side by side and see our latest picks.
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
