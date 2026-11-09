import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import CategoryPageClient, { type BuyOffer } from '@/app/components/category/CategoryPageClient'
import JsonLd from '@/app/components/JsonLd'
import { api, getCategory } from '@/lib/api'
import { ROUTES, SITE_URL } from '@/lib/config'
import { buildMetadata, noindexMetadata } from '@/lib/seo'
import { categoryDescription, categoryHeading, categoryLede, categoryTitle } from '@/lib/categoryCopy'
import { buildBreadcrumbList, buildItemList, phoneEntries } from '@/lib/structuredData'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ category: string }>
}

const currentYear = (): number => new Date().getFullYear()

function updatedLabel(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const data = await getCategory(slug)
  if (!data) return { title: 'Best Phones', robots: { index: false, follow: true } }

  const year = currentYear()
  const title = categoryTitle(data, year)

  if (!data.indexable) return noindexMetadata(data.path, title)
  return buildMetadata({
    title,
    description: categoryDescription(data, year),
    path: data.path,
    image: `${SITE_URL}${data.path}/opengraph-image`,
    imageAlt: `${title} on Specmob`,
  })
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const [data, list] = await Promise.all([
    getCategory(slug),
    api.categories.list().catch(() => null),
  ])
  if (!data) notFound()
  if (data.alias_of) permanentRedirect(data.path)

  const year = currentYear()
  const buy: Record<number, BuyOffer | undefined> = data.buy ?? {}
  const name = categoryHeading(data, year)

  return (
    <>
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Home', path: ROUTES.home },
          { name: 'Best Phones', path: ROUTES.best },
          { name, path: data.path },
        ])}
      />
      <JsonLd
        data={data.phones.length ? buildItemList(name, phoneEntries(data.phones), categoryDescription(data, year)) : null}
      />
      <CategoryPageClient
        data={data}
        categories={list?.categories ?? []}
        year={year}
        updatedLabel={updatedLabel(data.updated_at)}
        lede={categoryLede(data)}
        tradeOff={data.top_weakness ?? null}
        buy={buy}
      />
    </>
  )
}
