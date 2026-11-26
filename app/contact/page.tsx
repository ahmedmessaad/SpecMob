// app/contact/page.tsx
import { ArrowUpRight } from 'lucide-react'
import CompanyShell from '@/app/components/company/CompanyShell'
import { Section, P, Rows, Row } from '@/app/components/company/Prose'
import { CONTACT_EMAIL, ROUTES } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'
import { f, c } from '@/lib/tokens'
import { TEAM } from '@/lib/team'

export const metadata = buildMetadata({
  title: 'Contact Specmob',
  description: 'Report a wrong spec or price, send feedback, ask a business question, or reach the person behind Specmob.',
  path: ROUTES.contact,
})

const CONTACT_REASONS = [
  { label: 'Incorrect or outdated specs', subject: 'Data correction' },
  { label: 'Something is broken', subject: 'Bug report' },
  { label: 'Feature request or suggestion', subject: 'Feedback' },
  { label: 'Business or partnership', subject: 'Business inquiry' },
] as const

function mailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

function contactJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Specmob',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: CONTACT_EMAIL,
    },
    mainEntity: TEAM.map(m => ({
      '@type': 'Person',
      name: m.name,
      jobTitle: m.role,
      sameAs: m.links.map(l => l.url),
    })),
  }
}

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd()) }} />
      <CompanyShell
        current="contact"
        title="Contact Specmob"
        lede={
          <>
            <p>A wrong spec, a bug, feedback or a business question. Pick the closest topic or write to us directly.</p>
            <p>Including the phone name and what looks wrong makes corrections much faster.</p>
          </>
        }
      >
        <Section title="Write to us">
          <P>
            Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or start from a topic:
          </P>
          <Rows>
            {CONTACT_REASONS.map(reason => (
              <li key={reason.subject} className="co-row co-row--link">
                <a className="co-rowlink" href={mailto(reason.subject)}>
                  <span className="co-row-title">{reason.label}</span>
                  <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </li>
            ))}
          </Rows>
          <P>
            Business and partnership messages never affect rankings or scores. Looking to help keep the site running?{' '}
            <a href={ROUTES.fund}>Fund Specmob</a>. Curious how phones are scored? <a href={ROUTES.methodology}>How we score</a>.
          </P>
        </Section>

        <Section title="Built by">
          <P>Catalog, comparison engine, recommendation engine and scoring pipeline, built and shipped as one self-funded project.</P>
          {TEAM.map(member => (
            <div key={member.slug} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', margin: '24px 0 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {member.avatarUrl
                  ? <img src={member.avatarUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: f.serif, fontSize: 20, color: c.text1 }}>{member.name[0]}</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: f.serif, fontSize: 20, color: c.text1, lineHeight: 1.2 }}>{member.name}</div>
                <div style={{ fontSize: 13, color: c.text3, margin: '2px 0 10px' }}>{member.role}</div>
                <p>{member.bio}</p>
                {member.highlights.length > 0 && (
                  <p style={{ fontSize: 13.5 }}>{member.highlights.join(' · ')}</p>
                )}
                <p style={{ fontSize: 14 }}>
                  {member.links.map((link, i) => (
                    <span key={link.label}>
                      {i > 0 && ' · '}
                      <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </Section>
      </CompanyShell>
    </>
  )
}
