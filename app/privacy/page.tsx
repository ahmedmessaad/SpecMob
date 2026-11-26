// app/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT_EMAIL, SITE_URL } from '@/lib/config'
import CompanyShell from '@/app/components/company/CompanyShell'
import { H2, P, Bullets } from '@/app/components/company/Prose'
import { c } from '@/lib/tokens'

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy',
  description: 'What data Specmob collects, why, and what choices you have.',
  robots: { index: true, follow: true },
}

const EFFECTIVE_DATE = 'August 1, 2026'
const LAST_UPDATED = 'November 16, 2026'

const SECTIONS = [
  { id: 's1', label: '1. Information we collect' },
  { id: 's2', label: '2. What we don\u2019t do' },
  { id: 's3', label: '3. Third-party services' },
  { id: 's4', label: '4. Data retention' },
  { id: 's5', label: '5. Children\u2019s privacy' },
  { id: 's6', label: '6. Your choices' },
  { id: 's7', label: '7. Changes to this policy' },
  { id: 's8', label: '8. Contact' },
]

export default function PrivacyPage() {
  return (
    <CompanyShell
      current="privacy"
      title="Privacy policy"
      toc={SECTIONS}
      meta={<>Effective date: {EFFECTIVE_DATE} &middot; Last updated: {LAST_UPDATED}</>}
      lede={
        <p>
            Specmob (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) operates {SITE_URL.replace(/^https?:\/\//, '')} (the &quot;Service&quot;). This policy
            explains what data we collect, why, and what choices you have. We don&apos;t require an account
            to use Specmob, and we&apos;ve kept data collection to what&apos;s actually needed to run the site and
            keep it free.
          </p>
      }
    >
      <section className="co-section">
        <H2 id="s1">1. Information we collect</H2>
        <P><strong style={{ color: c.text1 }}>Automatically collected data.</strong> When you use Specmob, our servers log standard technical information for every request: IP address, browser/device type, pages visited, timestamps, and a request identifier used for debugging. This keeps the service running, secure, and performant (including rate-limiting to prevent abuse), and isn&apos;t linked to a named individual.</P>
        <P><strong style={{ color: c.text1 }}>Usage events.</strong> We record anonymous events such as page views, which phone pairs are viewed together on compare pages, and which in-page links are clicked. Each event carries a randomly generated, hashed session identifier that is not linked to your identity and does not contain your IP address. We use these counts to show popular comparisons and to improve navigation.</P>
        <P><strong style={{ color: c.text1 }}>Region.</strong> We use your approximate country or region to decide which retailer offers and currency to show. It is not linked to a named individual.</P>
        <P><strong style={{ color: c.text1 }}>View activity.</strong> When you view a phone&apos;s detail page, we log that a view occurred for that phone. This is used in aggregate to understand which phones people are interested in (for example, informing our &quot;trending&quot; rankings). It isn&apos;t tied to a user account or profile, since Specmob doesn&apos;t have accounts.</P>
        <p style={{ fontSize: 15, color: c.text2, lineHeight: 1.7, marginBottom: 8 }}>
          <strong style={{ color: c.text1 }}>Cookies and local storage.</strong> Specmob may use cookies or browser local storage for:
        </p>
        <Bullets items={[
          'Remembering display preferences (e.g. a saved comparison list), stored in your browser only, not on our servers',
          'Advertising, via Google AdSense, which may set cookies or use similar technologies to serve and measure ads',
          'Remembering your consent choice, where a consent message is shown (visitors in the European Economic Area, the United Kingdom and Switzerland)',
          'Affiliate link tracking, so retailers can attribute a purchase to Specmob when you click through',
        ]} />
        <P>You can disable cookies in your browser at any time; some personalization features (like a saved comparison) simply won&apos;t persist without them.</P>
        <P><strong style={{ color: c.text1 }}>Information you provide directly.</strong> If you contact us by email, we receive whatever you choose to include in that message. We use it only to respond to you.</P>
      </section>

      <section className="co-section">
        <H2 id="s2">2. What we don&apos;t do</H2>
        <Bullets items={[
          'We do not require account registration to browse, compare, or search phones.',
          'We do not sell your personal data to third parties.',
          'We do not send your personal browsing activity to our AI provider. When AI-generated comparison text or recommendations are produced, only the relevant phone specifications and your stated filters or priorities (budget, priorities selected) are sent to generate that text — not your identity, IP, or browsing history.',
        ]} />
      </section>

      <section className="co-section">
        <H2 id="s3">3. Third-party services</H2>
        <p style={{ fontSize: 15, color: c.text2, lineHeight: 1.7, marginBottom: 8 }}>Specmob uses or may use:</p>
        <Bullets items={[
          <><strong style={{ color: c.text1 }}>Advertising</strong> (Google AdSense) — ads are labelled and never influence rankings, scores or verdicts. Google may collect data to serve and measure ads; in the European Economic Area, the United Kingdom and Switzerland, personalized advertising and analytics storage are off until you choose otherwise in the consent message. See Google&apos;s policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: c.accent }}>policies.google.com/privacy</a>.</>,
          <><strong style={{ color: c.text1 }}>Affiliate programs</strong> (e.g. Amazon Associates, eBay Partner Network) — when you click a &quot;Buy&quot; or &quot;Where to Buy&quot; link, you leave Specmob and that retailer&apos;s own privacy policy applies to your activity on their site.</>,
          <><strong style={{ color: c.text1 }}>AI text generation</strong> — used to generate comparison verdicts and recommendation explanations from phone specification data.</>,
          <><strong style={{ color: c.text1 }}>Analytics</strong> — used in aggregate to understand traffic patterns and improve the site.</>,
        ]} />
        <P>We don&apos;t control these third parties&apos; own data practices; please review their respective policies.</P>
      </section>

      <section className="co-section">
        <H2 id="s4">4. Data retention</H2>
        <P>Technical request logs are retained only as long as needed for debugging and abuse prevention, then rotated out. Aggregate view-count data may be retained longer since it isn&apos;t tied to an individual.</P>
      </section>

      <section className="co-section">
        <H2 id="s5">5. Children&apos;s privacy</H2>
        <P>Specmob is not directed at children under 13, and we do not knowingly collect personal information from children under 13.</P>
      </section>

      <section className="co-section">
        <H2 id="s6">6. Your choices</H2>
        <Bullets items={[
          'Disable cookies via your browser settings.',
          'Where a consent message is shown, change your choice at any time using the privacy settings option the message provides, or clear this site\'s data in your browser.',
          <>Opt out of personalized advertising via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: c.accent }}>Google Ads Settings</a> or the <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: c.accent }}>Digital Advertising Alliance opt-out</a>.</>,
          'Contact us to ask what data, if any, we hold relating to a specific request you made (e.g. via IP) — as noted above, we do not maintain individual user profiles.',
        ]} />
      </section>

      <section className="co-section">
        <H2 id="s7">7. Changes to this policy</H2>
        <P>We may update this policy as the site evolves — for example, when adding new features or ad partners. We&apos;ll update the &quot;Last updated&quot; date above when we do. Continued use of Specmob after changes means you accept the updated policy.</P>
      </section>

      <section className="co-section">
        <H2 id="s8">8. Contact</H2>
        <P>
          Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: c.accent, fontWeight: 600 }}>{CONTACT_EMAIL}</a>, or use the <Link href="/contact" style={{ color: c.accent, fontWeight: 600 }}>Contact page</Link>. See also our <Link href="/terms" style={{ color: c.accent, fontWeight: 600 }}>Terms of Use</Link>.
        </P>
      </section>
    </CompanyShell>
  )
}
