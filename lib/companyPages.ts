import { ROUTES } from '@/lib/config'

export type CompanyPageKey = 'about' | 'methodology' | 'fund' | 'contact' | 'privacy' | 'terms'

export interface CompanyPage {
  label: string
  href: string
}

export const COMPANY_PAGES: Record<CompanyPageKey, CompanyPage> = {
  about: { label: 'About', href: ROUTES.about },
  methodology: { label: 'How we score', href: ROUTES.methodology },
  fund: { label: 'Fund Specmob', href: ROUTES.fund },
  contact: { label: 'Contact', href: ROUTES.contact },
  privacy: { label: 'Privacy', href: ROUTES.privacy },
  terms: { label: 'Terms', href: ROUTES.terms },
}
