// app/about/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import CompanyShell from '@/app/components/company/CompanyShell'
import { Section, Note as Callout } from '@/app/components/company/Prose'
import { c } from '@/lib/tokens'
import { ROUTES, SITE_URL, CONTACT_EMAIL } from '@/lib/config'

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  title: 'About Specmob',
  description:
    'How Specmob scores phones, where the data comes from, and how to reach us. No sponsored picks — every ranking is driven by specs.',
  openGraph: {
    title: 'About Specmob',
    description: 'How we score phones, where the data comes from, and how to reach us.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Specmob',
  url: `${SITE_URL}/about`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'About Specmob', item: `${SITE_URL}/about` },
    ],
  },
}

const TOC = [
  { id: 'scoring', label: 'How we score' },
  { id: 'tools', label: 'Tools' },
  { id: 'data', label: 'Data sources' },
  { id: 'contact', label: 'Contact' },
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompanyShell
        current="about"
        title="About Specmob"
        toc={TOC}
        breadcrumbSchema={false}
        lede={
          <>
            <p>
              Specmob is a phone comparison and buying-decision tool. We track specs, real prices, and release history across
              brands, and turn that into tools that answer one question: which phone actually fits what you need and what you
              want to spend. No sponsored picks, every ranking is driven by specs.
            </p>
            <p>
              We&apos;re not a retailer and we don&apos;t sell phones directly. When you follow a &quot;Buy&quot; link from
              Specmob to a retailer, we may earn a commission at no extra cost to you. See our{' '}
              <Link href="/terms#affiliate">Affiliate disclosure</Link> for details.
            </p>
          </>
        }
      >
      <Section
        id="scoring"
        title="How we score"
      >
        <p style={{ marginBottom: 16 }}>
          Every phone listed on Specmob is scored by our AI pipeline
          before it ever reaches a catalog page — there&apos;s no
          partial coverage and no phone showing up with an empty scoring
          section.
        </p>

        <p style={{ marginBottom: 16 }}>
          Specs come from public listings, an AI model rates them within
          each phone&apos;s market tier, and the same rules apply to every
          brand. The full component-by-component method is on{' '}
          <Link
            href={ROUTES.methodology}
            style={{ color: c.accent, fontWeight: 600, textDecoration: 'underline' }}
          >
            How we score
          </Link>
          .
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>Smart Score.</strong> Each
          phone is scored across six dimensions — camera, performance,
          battery, display, build quality, and value — by an AI model
          evaluating the phone&apos;s actual specifications. Each
          dimension receives its own score, and those six sub-scores are
          averaged into the single overall number shown on cards, detail
          pages, and comparisons.
        </p>

        <p style={{ marginBottom: 16 }}>
          The overall score is a fixed property of the phone itself. The
          number you see on a category page and the number you see on the
          phone&apos;s own detail page are always the same — it does not
          change depending on which page you&apos;re viewing.
        </p>

        <p style={{ marginBottom: 12 }}>
          <strong style={{ color: c.text1 }}>Tier system.</strong> Every
          phone is placed into one of five market tiers as part of that
          same scoring pass:
        </p>

        <p style={{ marginBottom: 16 }}>
          Ultra flagship, flagship, upper mid-range, mid-range and budget.
        </p>

        <p style={{ marginBottom: 16 }}>
          Tier placement weighs the AI-assigned tier first, and where
          that&apos;s absent, falls back to detecting the tier from the
          chipset itself — matched against known flagship and
          upper-mid-range silicon: Snapdragon 8-series, Dimensity
          9000-series, Apple A-series Bionic/Pro, Tensor, Kirin, and
          Exynos.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>Value score.</strong> The
          value score is not simply a ranking of the cheapest phones.
          Instead, it looks at what hardware a phone provides relative to
          its price and compares it with a real peer group of similarly
          priced phones.
        </p>

        <p style={{ marginBottom: 16 }}>
          The hardware side of that comparison includes factors such as
          benchmark performance, camera resolution, battery capacity, RAM,
          charging speed, and screen size. These are combined into a
          hardware composite and evaluated within the phone&apos;s
          relevant price group rather than against the entire phone
          catalog.
        </p>

        <p style={{ marginBottom: 16 }}>
          This means <strong style={{ color: c.text1 }}>
            cheaper does not automatically mean better value
          </strong>
          . A more expensive phone can still receive a higher value
          score when its overall hardware package compares more
          favorably with other phones around its price level. Likewise,
          a cheaper phone is not guaranteed a high value score simply
          because it costs less.
        </p>

        <Callout>
          <strong style={{ color: c.text1 }}>Why use peer groups?</strong>{' '}
          A budget phone should be judged against other phones competing
          at a similar price, not against an ultra-flagship costing
          several times more. The goal is to measure how much hardware a
          phone delivers for the market it actually competes in.
        </Callout>

        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>
            Category rankings.
          </strong>{' '}
          Best Camera Phones, Best Battery Life, Foldables, and every
          other &quot;Best Of&quot; list are ranked directly off the
          Smart Score dimension relevant to that category.
        </p>

        <p style={{ marginBottom: 0 }}>
          <strong style={{ color: c.text1 }}>AI-generated text.</strong>{' '}
          Comparison verdicts, match explanations, and trade-off notes
          on comparison and recommendation pages are written by an AI
          model based on the phones&apos; real specifications and your
          stated priorities or budget. This is a summary layer on top of
          the underlying data — it never changes the specs, prices, or
          scores, and it&apos;s regenerated from scratch each time rather
          than written by hand. If that generation step fails or is
          unavailable, these pages still work; you simply see the specs
          and scores without the written commentary.
        </p>

        <Callout>
          We continuously refine the scoring model and tier detection as
          new hardware releases. If a score or tier looks wrong,{' '}
          <a
            href="#contact"
            style={{
              color: c.accent,
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            contact us
          </a>{' '}
          — we read every message.
        </Callout>
      </Section>

      <Section
        id="tools"
        title="Tools"
      >
        <p style={{ marginBottom: 16 }}>
          Beyond browsing and comparing, Specmob has a few
          purpose-built tools:
        </p>

        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 0,
            paddingLeft: 0,
            listStyle: 'none',
          }}
        >
          {[
            <>
              <strong style={{ color: c.text1 }}>
                Pick a phone
              </strong>{' '}
              (
              <Link
                href={ROUTES.pick}
                style={{
                  color: c.accent,
                  textDecoration: 'underline',
                }}
              >
                /pick
              </Link>
              ) — set a budget and pick 2–3 priorities, and we rank the
              top 5 matching phones using the same scoring logic
              described above.
            </>,
            <>
              <strong style={{ color: c.text1 }}>Compare</strong>{' '}
              (
              <Link
                href={ROUTES.compare}
                style={{
                  color: c.accent,
                  textDecoration: 'underline',
                }}
              >
                /compare
              </Link>
              ) — put up to 4 phones side by side with every spec, an
              AI-written verdict, and a category-by-category winner
              breakdown.
            </>,
            <>
              <strong style={{ color: c.text1 }}>
                Trade-In Estimator
              </strong>{' '}
              (
              <Link
                href={ROUTES.tradein}
                style={{
                  color: c.accent,
                  textDecoration: 'underline',
                }}
              >
                /trade-in
              </Link>
              ) — get an estimated resale range for a phone you own
              based on its condition, battery health, and functional
              state, plus recommendations for what you could upgrade to
              with that value.
            </>,
          ].map((item, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: c.accent,
                  flexShrink: 0,
                  marginTop: 10,
                }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="data"
        title="Data sources"
      >
        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>Specifications.</strong>{' '}
          Phone specs — dimensions, display, camera, chipset, battery,
          connectivity, and more — are aggregated from publicly
          available manufacturer specifications and established
          phone-database sources, then normalized into a consistent
          structure so every phone can be compared apples-to-apples
          regardless of brand.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>Pricing.</strong> We track
          pricing over time rather than showing a single static number.
          Prices are checked periodically per phone and per region where
          available, which is what powers our price history charts and
          price-drop detection. Prices are shown for reference and can
          lag real-world changes — always confirm the final price on the
          retailer&apos;s page before buying.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>Benchmarks.</strong>{' '}
          Performance figures — AnTuTu, GPU scores, and similar — come
          from published third-party benchmark results for each chipset,
          not from our own testing.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong style={{ color: c.text1 }}>
            Known limitations.
          </strong>{' '}
          Specs data can occasionally contain scraping artifacts or gaps,
          especially for newly released or less mainstream phones. We
          run automated repair checks on known problem fields, but if you
          spot something that looks clearly wrong, flagging it via{' '}
          <a
            href="#contact"
            style={{
              color: c.accent,
              textDecoration: 'underline',
            }}
          >
            Contact
          </a>{' '}
          helps us fix it faster than we&apos;d catch it ourselves.
        </p>

        <p style={{ marginBottom: 0 }}>
          <strong style={{ color: c.text1 }}>
            Data freshness.
          </strong>{' '}
          Not every field refreshes on the same interval — stable data
          (specs, brand info) is cached longer than time-sensitive data
          (prices, trending rankings), so different parts of a page may
          reflect slightly different snapshot times.
        </p>
      </Section>

      <Section
        id="contact"
        title="Contact"
      >
        <p style={{ marginBottom: 16 }}>
          Corrections, feedback, or business inquiries — the fastest
          route is our{' '}
          <Link
            href={ROUTES.contact}
            style={{
              color: c.accent,
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Contact page
          </Link>
          , which routes each type of message correctly. Or email
          directly:{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              color: c.accent,
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            {CONTACT_EMAIL}
          </a>
        </p>

        <p style={{ marginBottom: 16 }}>
          For data corrections specifically, including the phone
          name/model and what looks wrong speeds things up a lot.
        </p>

        <p
          style={{
            marginBottom: 0,
            color: c.text3,
            fontSize: 13.5,
          }}
        >
          We aim to respond within a few business days.
        </p>
      </Section>
      </CompanyShell>
    </>
  )
}
