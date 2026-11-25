// app/compare/layout.tsx
import type { Metadata } from 'next'
import { ROUTES } from '@/lib/config'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Compare Up to 4 Phones Side by Side',
  description:
    'Compare 2, 3 or 4 phones at once: full spec table, category winners and a clear verdict. Start from a popular matchup or search any phones.',
  path: ROUTES.compare,
})

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
