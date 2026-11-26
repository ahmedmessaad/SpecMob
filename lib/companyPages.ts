import { ROUTES } from '@/lib/config'

export type CompanyPageKey = 'about' | 'methodology' | 'fund' | 'contact' | 'privacy' | 'terms'

export interface CompanyPage {
  label: string
  href: string
}

export const COMPANY_PAGES: Record<CompanyPageKey, CompanyPage> = {
  about: { label: 'About Specmob', href: ROUTES.about },
  methodology: { label: 'How we score', href: ROUTES.methodology },
  fund: { label: 'Fund Specmob', href: ROUTES.fund },
  contact: { label: 'Contact Specmob', href: ROUTES.contact },
  privacy: { label: 'Privacy policy', href: ROUTES.privacy },
  terms: { label: 'Terms of use', href: ROUTES.terms },
}
