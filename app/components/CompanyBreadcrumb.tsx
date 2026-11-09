import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import JsonLd from '@/app/components/JsonLd'
import { ROUTES } from '@/lib/config'
import { buildBreadcrumbList } from '@/lib/structuredData'
import { COMPANY_PAGES, type CompanyPageKey } from '@/lib/companyPages'
import { c } from '@/lib/tokens'

interface Props {
  current: CompanyPageKey
  /** Set to false when the page already emits its own BreadcrumbList. */
  breadcrumbSchema?: boolean
}

export default function CompanyBreadcrumb({ current, breadcrumbSchema = true }: Props) {
  const page = COMPANY_PAGES[current]

  return (
    <>
      {breadcrumbSchema && (
        <JsonLd data={buildBreadcrumbList([{ name: 'Home', path: ROUTES.home }, { name: page.label, path: page.href }])} />
      )}
      <nav
        aria-label="Breadcrumb"
        style={{ padding: '24px 0 0', fontSize: 13, color: c.text3, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <Link href={ROUTES.home} style={{ color: c.text2 }}>Home</Link>
        <ChevronRight size={11} aria-hidden="true" />
        <span aria-current="page">{page.label}</span>
      </nav>
    </>
  )
}
