// app/search/page.tsx
import type { Metadata } from 'next'
import { noindexMetadata } from '@/lib/seo'
import SearchResultsClient from '@/app/components/search/SearchResultsClient'

// Static shell. Results are fetched in the browser, so crawlers hitting
// /search?q=... never start a server render.
export const metadata: Metadata = noindexMetadata('/search', 'Search phones')

export default function SearchPage() {
  return <SearchResultsClient />
}
