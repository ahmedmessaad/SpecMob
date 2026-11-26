import CompanyShell from '@/app/components/company/CompanyShell'
import { Section, P, H3, Rows, Row } from '@/app/components/company/Prose'
import CryptoCard from '@/app/components/support/CryptoCard'
import { ROUTES } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'
import { c } from '@/lib/tokens'
import { COST_ITEMS, MONTHLY_GOAL_USD, MONTHLY_RAISED_USD, SUPPORT_LINKS, CRYPTO_ADDRESSES } from '@/lib/supportData'

export const metadata = buildMetadata({
  title: 'Fund Specmob: What It Costs to Run and How to Help',
  description:
    'Specmob is self-funded and ranks phones on specs, never sponsors. See what it costs to run each month and how to chip in.',
  path: ROUTES.fund,
})

const OTHER_WAYS = [
  { title: 'Use the Buy links', text: 'Some are affiliate links. You pay the same price and we may earn a commission.', href: ROUTES.best, cta: 'Browse rankings' },
  { title: 'Share a comparison', text: 'Sending a comparison to a friend is the cheapest way to help the site grow.', href: ROUTES.compare, cta: 'Compare phones' },
  { title: 'Fix a wrong spec', text: 'A correction improves the data for everyone who visits after you.', href: ROUTES.contact, cta: 'Report an issue' },
] as const

export default function FundPage() {
  const pct = Math.min(100, Math.round((MONTHLY_RAISED_USD / MONTHLY_GOAL_USD) * 100))

  return (
    <CompanyShell
      current="fund"
      title="Fund Specmob"
      lede={
        <>
          <p>
            Specmob is self-funded and has no sponsored placements. Rankings are built from specs, so the running costs
            are covered by affiliate links, light ads and voluntary support.
          </p>
          <p>
            Need help with a phone or the site? <a href={ROUTES.contact}>Contact us</a>. This page is only about funding.
          </p>
        </>
      }
    >
      <Section title="Monthly running cost">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: c.text2, marginBottom: 10 }}>
          <span>Covered each month</span>
          <span>${MONTHLY_RAISED_USD.toFixed(2)} of ${MONTHLY_GOAL_USD.toFixed(2)}</span>
        </div>
        <div className="co-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Share of monthly cost covered">
          <div style={{ width: `${pct}%` }} />
        </div>
        <p style={{ marginTop: 10, fontSize: 13, color: c.text3 }}>Updated manually, not a live counter. Figures reflect actual hosting bills.</p>

        <H3>Where it goes</H3>
        <Rows>
          {COST_ITEMS.map(item => (
            <Row
              key={item.label}
              title={item.label}
              text={item.detail}
              end={`$${item.monthlyUsd.toFixed(2)}/mo`}
              endNote={item.status === 'covered' ? 'Covered' : 'Needed'}
            />
          ))}
        </Rows>
      </Section>

      <Section title="Chip in">
        <P>Entirely optional. Support never changes a ranking or a score, and the site stays free either way.</P>

        {SUPPORT_LINKS.length > 0 && (
          <div className="co-actions">
            {SUPPORT_LINKS.map(link => (
              <a key={link.label} className="co-btn" href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label} <small>{link.note}</small>
              </a>
            ))}
          </div>
        )}

        {CRYPTO_ADDRESSES.length > 0 && (
          <>
            <H3>Or send crypto directly</H3>
            <CryptoCard entries={CRYPTO_ADDRESSES} />
          </>
        )}
      </Section>

      <Section title="Other ways to help">
        <P>No money needed.</P>
        <Rows>
          {OTHER_WAYS.map(way => <Row key={way.title} title={way.title} text={way.text} end={way.cta} href={way.href} />)}
        </Rows>
        <P>
          Curious how rankings stay independent? Read <a href={ROUTES.methodology}>How we score</a> or{' '}
          <a href={ROUTES.about}>About Specmob</a>.
        </P>
      </Section>
    </CompanyShell>
  )
}
