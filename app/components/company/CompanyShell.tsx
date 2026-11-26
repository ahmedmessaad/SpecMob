import { Suspense } from 'react'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import CompanyBreadcrumb from '@/app/components/CompanyBreadcrumb'
import { type CompanyPageKey } from '@/lib/companyPages'
import { c, f } from '@/lib/tokens'

export interface TocItem {
  id: string
  label: string
}

interface Props {
  current: CompanyPageKey
  title: string
  lede?: React.ReactNode
  meta?: React.ReactNode
  toc?: readonly TocItem[]
  breadcrumbSchema?: boolean
  children: React.ReactNode
}

const CSS = `
.co-main{max-width:1040px;margin:0 auto;padding:0 var(--page-px) 96px}
.co-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:56px;margin-top:40px}
.co-grid--toc{grid-template-columns:180px minmax(0,720px)}
.co-col{max-width:720px;min-width:0}
.co-toc{position:sticky;top:calc(var(--nav-h) + 24px);align-self:start;font-size:13px}
.co-toc-title{font-size:12px;color:var(--text-3);margin:0 0 10px}
.co-toc a{display:block;padding:6px 0;color:var(--text-3);text-decoration:none;transition:color 150ms ease}
.co-toc a:hover{color:var(--text-1)}
.co-title{font-family:var(--font-serif);font-weight:400;font-size:clamp(34px,4.4vw,48px);line-height:1.08;letter-spacing:-0.8px;color:var(--text-1);margin:0 0 14px}
.co-meta{font-size:13px;color:var(--text-3);margin:0 0 16px}
.co-lede p{font-size:17px;line-height:1.65;color:var(--text-2);margin:0 0 12px;max-width:640px}
.co-lede p + p{font-size:15px;color:var(--text-3)}
.co-section{padding:36px 0;border-top:1px solid var(--border);scroll-margin-top:calc(var(--nav-h) + 20px)}
.co-section:last-child{padding-bottom:0}
.co-h2{font-family:var(--font-serif);font-weight:400;font-size:26px;line-height:1.2;letter-spacing:-0.3px;color:var(--text-1);margin:0 0 16px;scroll-margin-top:calc(var(--nav-h) + 20px)}
.co-h3{font-size:13px;font-weight:600;color:var(--text-2);margin:24px 0 10px}
.co-body p{font-size:15.5px;line-height:1.75;color:var(--text-2);margin:0 0 14px;max-width:680px}
.co-body strong{color:var(--text-1);font-weight:600}
.co-body a:not(.co-btn):not(.co-rowlink){color:var(--text-1) !important;font-weight:500 !important;text-decoration:underline !important;text-decoration-color:var(--accent) !important;text-underline-offset:3px}
.co-bullets{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column;gap:8px}
.co-bullets li{display:flex;gap:12px;font-size:15.5px;line-height:1.7;color:var(--text-2)}
.co-bullets li::before{content:"";width:4px;height:4px;border-radius:50%;background:var(--text-3);flex-shrink:0;margin-top:11px}
.co-rows{list-style:none;margin:0 0 14px;padding:0;border-top:1px solid var(--border)}
.co-row{display:flex;gap:20px;align-items:baseline;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border)}
.co-row--link{padding:0}
.co-row-main{min-width:0}
.co-row-title{font-size:15px;font-weight:600;color:var(--text-1);margin:0}
.co-row-text{font-size:13.5px;line-height:1.6;color:var(--text-3);margin:2px 0 0}
.co-row-end{flex-shrink:0;text-align:right;font-size:14px;font-weight:600;color:var(--text-1);white-space:nowrap}
.co-row-end small{display:block;font-size:12px;font-weight:400;color:var(--text-3)}
.co-rowlink{display:flex;gap:20px;align-items:baseline;justify-content:space-between;width:100%;padding:14px 0;color:var(--text-1);text-decoration:none;transition:color 150ms ease}
.co-rowlink:hover{color:var(--accent)}
.co-rowlink:focus-visible,.co-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.co-note{border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:14px 0;margin:24px 0;font-size:14px;line-height:1.65;color:var(--text-2)}
.co-note p{font-size:14px !important;margin:0 !important}
.co-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:var(--r-full);background:var(--primary);color:#fff !important;font-size:14px;font-weight:600;text-decoration:none !important;transition:background 150ms ease}
.co-btn:hover{background:var(--primary-hover)}
.co-btn small{font-size:12px;font-weight:400;opacity:.7}
.co-actions{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 20px}
.co-bar{height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.co-bar > div{height:100%;background:var(--green)}
@media (max-width:900px){.co-grid--toc{grid-template-columns:minmax(0,1fr)}.co-toc{display:none}}
@media (prefers-reduced-motion:reduce){.co-rowlink,.co-btn,.co-toc a{transition:none}}
`

export default function CompanyShell({ current, title, lede, meta, toc, breadcrumbSchema, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: c.bg }}>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className="co-main">
        <CompanyBreadcrumb current={current} breadcrumbSchema={breadcrumbSchema} />

        <div className={toc ? 'co-grid co-grid--toc' : 'co-grid'}>
          {toc && (
            <nav className="co-toc" aria-label="On this page">
              <p className="co-toc-title">On this page</p>
              {toc.map(item => (
                <a key={item.id} href={`#${item.id}`}>{item.label}</a>
              ))}
            </nav>
          )}

          <div className="co-col">
            <header style={{ paddingBottom: 36 }}>
              <h1 className="co-title" style={{ fontFamily: f.serif }}>{title}</h1>
              {meta && <p className="co-meta">{meta}</p>}
              {lede && <div className="co-lede">{lede}</div>}
            </header>
            <div className="co-body">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
      <style>{CSS}</style>
    </div>
  )
}
