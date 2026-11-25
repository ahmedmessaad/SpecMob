import { Suspense } from 'react'
import Link from 'next/link'
import { Server, HardDrive, Sparkles, Heart } from 'lucide-react'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import CompanyBreadcrumb from '@/app/components/CompanyBreadcrumb'
import CryptoCard from '@/app/components/support/CryptoCard'
import { ROUTES } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'
import { c, f, r, sh } from '@/lib/tokens'
import { COST_ITEMS, MONTHLY_GOAL_USD, MONTHLY_RAISED_USD, SUPPORT_LINKS, CRYPTO_ADDRESSES } from '@/lib/supportData'

export const metadata = buildMetadata({
  title: 'Help keep Specmob running',
  description:
    'Specmob is self-funded and ranks phones on specs, never sponsors. See what it costs to run each month and how to chip in.',
  path: ROUTES.fund,
})

const ICON_BY_LABEL: Record<string, React.ReactNode> = {
  'Database storage': <HardDrive size={16} strokeWidth={1.5} />,
  'API hosting': <Server size={16} strokeWidth={1.5} />,
  'AI copy generation': <Sparkles size={16} strokeWidth={1.5} />,
}

const OTHER_WAYS = [
  { title: 'Use the Buy links', text: 'Some are affiliate links. You pay the same price and we may earn a commission.', href: ROUTES.best, cta: 'Browse rankings' },
  { title: 'Share a comparison', text: 'Sending a comparison to a friend is the cheapest way to help the site grow.', href: ROUTES.compare, cta: 'Compare phones' },
  { title: 'Fix a wrong spec', text: 'A correction improves the data for everyone who visits after you.', href: ROUTES.contact, cta: 'Report an issue' },
] as const

export default function FundPage() {
  const pct = Math.min(100, Math.round((MONTHLY_RAISED_USD / MONTHLY_GOAL_USD) * 100))
  const h2: React.CSSProperties = { fontFamily: f.serif, fontSize: 22, color: c.text1, fontWeight: 400 }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F0' }}>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 var(--page-px) 80px' }}>
        <CompanyBreadcrumb current="fund" />

        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px',
            background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
            borderRadius: r.full, fontSize: 11, fontWeight: 600, color: c.accent,
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 18,
          }}>
            No ads on this page. No pressure anywhere else.
          </div>
          <h1 style={{ fontFamily: f.serif, fontSize: 'clamp(32px,4vw,48px)', color: c.text1, letterSpacing: '-0.6px', marginBottom: 12, fontWeight: 400 }}>
            Keeping Specmob running
          </h1>
          <p style={{ fontSize: 15, color: c.text3, maxWidth: 520, margin: '0 auto 14px', lineHeight: 1.65 }}>
            Specmob is self-funded and has no sponsored placements. Rankings are built from specs, so the running costs
            are covered by affiliate links, light ads and voluntary support. Here is exactly what it costs each month.
          </p>
          <p style={{ fontSize: 13, color: c.text3, margin: 0 }}>
            Need help with a phone or the site?{' '}
            <Link href={ROUTES.contact} style={{ color: c.accent, fontWeight: 600, textDecoration: 'underline' }}>Contact us</Link>.
            This page is only about funding.
          </p>
        </div>

        <section aria-labelledby="cost-heading" style={{
          background: '#FFFFFF', border: `1px solid ${c.border}`, borderRadius: r.xl,
          padding: '24px 26px', marginBottom: 20, boxShadow: sh.sm,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 id="cost-heading" style={{ fontSize: 13, fontWeight: 600, color: c.text2, margin: 0, fontFamily: 'inherit' }}>Monthly running cost</h2>
            <span style={{ fontSize: 13, color: c.text3 }}>
              ${MONTHLY_RAISED_USD.toFixed(2)} of ${MONTHLY_GOAL_USD.toFixed(2)} covered
            </span>
          </div>
          <div
            role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Share of monthly cost covered"
            style={{ height: 8, background: '#F8F6F0', borderRadius: 4, overflow: 'hidden' }}
          >
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 4 }} />
          </div>
          <p style={{ fontSize: 12, color: c.text3, marginTop: 10, marginBottom: 0 }}>
            Updated manually, not a live counter. Figures reflect actual hosting bills.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...h2, marginBottom: 16 }}>Where it goes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COST_ITEMS.map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: '#FFFFFF', border: `1px solid ${c.border}`, borderRadius: r.lg,
                }}
              >
                <div style={{
                  width: 34, height: 34, flexShrink: 0, borderRadius: r.sm, background: '#F8F6F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text2,
                }}>
                  {ICON_BY_LABEL[item.label]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text1 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: c.text3, marginTop: 1 }}>{item.detail}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text1 }}>${item.monthlyUsd.toFixed(2)}/mo</div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px',
                    color: item.status === 'covered' ? 'var(--green)' : 'var(--orange)',
                  }}>
                    {item.status === 'covered' ? 'Covered' : 'Needed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ ...h2, marginBottom: 6 }}>Chip in</h2>
          <p style={{ fontSize: 13, color: c.text3, marginBottom: 22 }}>
            Entirely optional. Support never changes a ranking or a score, and the site stays free either way.
          </p>

          {SUPPORT_LINKS.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              {SUPPORT_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fund-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                    background: c.primary, color: '#fff', borderRadius: r.full,
                    fontSize: 14, fontWeight: 600, transition: 'background 0.15s',
                  }}
                >
                  <Heart size={15} strokeWidth={2} aria-hidden="true" /> {link.label}
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>{link.note}</span>
                </a>
              ))}
            </div>
          )}

          {CRYPTO_ADDRESSES.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: c.border }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: c.text3, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  Or send crypto directly
                </span>
                <div style={{ flex: 1, height: 1, background: c.border }} />
              </div>
              <CryptoCard entries={CRYPTO_ADDRESSES} />
            </div>
          )}
        </section>

        <section aria-labelledby="other-ways">
          <h2 id="other-ways" style={{ ...h2, marginBottom: 6, textAlign: 'center' }}>Other ways to help</h2>
          <p style={{ fontSize: 13, color: c.text3, textAlign: 'center', marginBottom: 18 }}>
            No money needed.
          </p>
          <div className="fund-ways" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {OTHER_WAYS.map(way => (
              <Link
                key={way.title}
                href={way.href}
                className="fund-way"
                style={{
                  display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 18px',
                  background: '#FFFFFF', border: `1px solid ${c.border}`, borderRadius: r.lg, boxShadow: sh.sm,
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: c.text1 }}>{way.title}</span>
                <span style={{ fontSize: 12.5, color: c.text3, lineHeight: 1.55, flex: 1 }}>{way.text}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: c.accent }}>{way.cta}</span>
              </Link>
            ))}
          </div>
          <p style={{ fontSize: 13, color: c.text3, textAlign: 'center', marginTop: 28 }}>
            Curious how rankings stay independent? Read{' '}
            <Link href={ROUTES.methodology} style={{ color: c.accent, fontWeight: 600, textDecoration: 'underline' }}>how we score</Link>
            {' '}or{' '}
            <Link href={ROUTES.about} style={{ color: c.accent, fontWeight: 600, textDecoration: 'underline' }}>about Specmob</Link>.
          </p>
        </section>
      </main>

      <Footer />

      <style>{`
        .fund-link:hover { background: #2A2A42 !important; }
        .fund-link:focus-visible, .fund-way:focus-visible { outline: 2px solid ${c.accent}; outline-offset: 2px; }
        .fund-way:hover { border-color: ${c.accent} !important; }
        @media (max-width: 640px) { .fund-ways { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { .fund-link, .fund-way { transition: none !important; } }
      `}</style>
    </div>
  )
}
