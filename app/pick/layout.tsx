import type { Metadata } from 'next'
import { ROUTES } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Which Phone Should I Buy? Phone Finder by Budget',
  description:
    'Not sure which phone to buy? Set a budget, choose what matters, and get a ranked shortlist with trade-offs. No spec knowledge needed, no sponsored picks.',
  path: ROUTES.pick,
})

export default function PickLayout({ children }: { children: React.ReactNode }) {
  return children
}
