import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { ROUTES } from '@/lib/config'
import { mq } from '@/lib/tokens'
import FeedbackTrigger from './FeedbackTrigger'
import FeedbackModal from './FeedbackModal'

interface FooterLink {
  label: string
  href: string
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Brands', href: ROUTES.brands },
      { label: 'Compare', href: ROUTES.compare },
      { label: 'Trade-in value', href: ROUTES.tradein },
    ],
  },
  {
    title: 'Rankings',
    links: [
      { label: 'Camera', href: ROUTES.category('camera-phones') },
      { label: 'Battery life', href: ROUTES.category('battery-life') },
      { label: 'Gaming', href: ROUTES.category('gaming-phones') },
      { label: 'Under $500', href: ROUTES.category('under-500') },
    ],
  },
  {
    title: 'Specmob',
    links: [
      { label: 'About', href: ROUTES.about },
      { label: 'How we score', href: ROUTES.methodology },
      { label: 'Contact', href: ROUTES.contact },
      { label: 'Fund Specmob', href: ROUTES.fund },
    ],
  },
]

const LEGAL: FooterLink[] = [
  { label: 'Privacy', href: ROUTES.privacy },
  { label: 'Terms', href: ROUTES.terms },
]

const SOCIALS = [
  { key: 'x', label: 'X', href: 'https://x.com/specmobplatform' },
  { key: 'instagram', label: 'Instagram', href: 'https://instagram.com/specmobplatform' },
] as const

const CSS = `
.ft {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 75vh;
  min-height: 75svh;
  display: flex;
  flex-direction: column;
  background: var(--primary);
  color: rgba(255,255,255,0.6);
}

/* Light enters from the sides; the center stays dark. */
.ft::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 42% 85% at 0% 55%, rgba(225,56,71,0.26), transparent 100%),
    radial-gradient(ellipse 38% 80% at 100% 45%, rgba(110,48,83,0.24), transparent 100%),
    radial-gradient(ellipse 60% 30% at 50% 100%, rgba(65,52,105,0.10), transparent 100%);
}

.ft::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: min(45%, 550px);
  height: 65%;
  z-index: -1;
  pointer-events: none;
  background-image: radial-gradient(rgba(225,56,71,0.22) 1px, transparent 1.4px);
  background-size: 13px 13px;
  -webkit-mask-image: radial-gradient(ellipse at 100% 0%, #000 0%, transparent 75%);
  mask-image: radial-gradient(ellipse at 100% 0%, #000 0%, transparent 75%);
  opacity: 0.45;
}

.ft-hero {
  max-width: var(--max-w);
  width: 100%;
  margin: 0 auto;
  padding: 64px var(--page-px) 0;
  text-align: center;
}
.ft-brand { font-family: var(--font-wordmark); font-style: italic; font-size: 40px; line-height: 1; letter-spacing: -0.6px; color: #fff; }
.ft-brand span { color: var(--accent); font-style: normal; }
.ft-tagline { margin: 12px 0 22px; font-size: 14.5px; color: rgba(255,255,255,0.55); }
.ft-tagline em { font-style: normal; color: #F0A8AC; }
.ft-actions { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
.ft-social { display: flex; gap: 8px; }
.ft-social a {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%;
  transition: background .15s, color .15s, border-color .15s;
}
.ft-social a:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.5); color: #fff; }

.ft-cols {
  max-width: 760px;
  width: 100%;
  margin: 0 auto auto;
  padding: 24px var(--page-px) 48px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  text-align: center;
}
.ft-label {
  margin: 0 0 14px; font-family: var(--font-sans); font-size: 11px; font-weight: 600;
  letter-spacing: 1.4px; text-transform: uppercase; color: rgba(255,255,255,0.38);
}
.ft-list { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 0; padding: 0; list-style: none; }
.ft-link { position: relative; display: inline-block; font-size: 14px; color: rgba(255,255,255,0.8); transition: color .15s; }
.ft-link::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px; background: var(--accent);
  transform: scaleX(0); transform-origin: left; transition: transform .22s ease;
}
.ft-link:hover { color: #fff; }
.ft-link:hover::after { transform: scaleX(1); }

.ft-bar { border-top: 1px solid rgba(255,255,255,0.1); }
.ft-bar-row {
  max-width: var(--max-w); margin: 0 auto; padding: 16px var(--page-px);
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 24px;
  font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.42);
}
.ft-bar-right { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.ft-legal { display: flex; gap: 18px; }
.ft-legal a { color: rgba(255,255,255,0.65); transition: color .15s; }
.ft-legal a:hover { color: #fff; }
.ft-aff { color: inherit; text-decoration: underline; text-underline-offset: 2px; transition: color .15s; }
.ft-aff:hover { color: #fff; }
.ft-status { display: inline-flex; align-items: center; gap: 6px; }
.ft-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

.ft a:focus-visible, .ft button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; border-radius: var(--r-sm); }

${mq.sm} {
  .ft-hero { padding-top: 48px; }
  .ft-cols { gap: 32px 12px; padding-top: 24px; padding-bottom: 40px; }
  .ft-link { font-size: 13px; }
  .ft-bar-row, .ft-bar-right { flex-direction: column; text-align: center; }
}
@media (max-width: 380px) {
  .ft-cols { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) { .ft-link::after, .ft-social a { transition: none; } }
`

function XIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="ft" aria-label="Site footer">
      <div className="ft-hero">
        <div className="ft-brand">Specmob<span>.</span></div>
        <p className="ft-tagline">Every score from the spec sheet. <em>Nothing paid for.</em></p>
        <div className="ft-actions">
          <FeedbackTrigger variant="footer" />
          <div className="ft-social">
            {SOCIALS.map(s => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                {s.key === 'x' ? <XIcon /> : <Instagram size={13} aria-hidden="true" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="ft-cols">
        {COLUMNS.map(col => (
          <nav key={col.title} aria-label={col.title}>
            <div className="ft-label">{col.title}</div>
            <ul className="ft-list">
              {col.links.map(l => (
                <li key={l.href}>
                  <Link prefetch={false} href={l.href} className="ft-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="ft-bar">
        <div className="ft-bar-row">
          <span>
            &copy; {new Date().getFullYear()} Specmob. Some purchase links are <Link prefetch={false} href={`${ROUTES.terms}#affiliate`} className="ft-aff">affiliate links</Link>; we may earn a commission at no cost to you.
          </span>
          <div className="ft-bar-right">
            <span className="ft-status"><i aria-hidden="true" />Specs updated daily</span>
            <div className="ft-legal">
              {LEGAL.map(l => (
                <Link key={l.href} prefetch={false} href={l.href}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal />
      <style>{CSS}</style>
    </footer>
  )
}
