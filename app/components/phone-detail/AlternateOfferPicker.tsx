'use client'

import { ChevronDown, ExternalLink, Store } from 'lucide-react'
import { c } from '@/lib/tokens'
import { formatLocal, formatUsd } from '@/lib/price'
import { useRegion } from '@/lib/regionStore'
import type { PhoneOffer } from '@/lib/types'
import { analytics } from '@/lib/analytics'

export function AlternateOffersToggle({
  count, open, onToggle, panelId,
}: {
  count: number
  open: boolean
  onToggle: () => void
  panelId: string
}) {
  return (
    <button
      type="button"
      className={`hero-ghost${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <Store size={15} strokeWidth={2} />
      {count} other store{count > 1 ? 's' : ''}
      <ChevronDown
        size={15}
        strokeWidth={2}
        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
      />
    </button>
  )
}

export function AlternateOffersPanel({
  offers, phone, open, panelId,
}: {
  offers: PhoneOffer[]
  phone: { id: number; display_name: string }
  open: boolean
  panelId: string
}) {
  const { region } = useRegion()

  if (offers.length === 0) return null

  return (
    <div id={panelId} className={`alt-panel${open ? ' open' : ''}`}>
      <div className="alt-panel-inner">
        <ul className="alt-list">
          {offers.map(offer => {
            const sameRegion = !!region && !!offer.region && region.toUpperCase() === offer.region.toUpperCase()
            const price = offer.is_placeholder ? null : sameRegion && offer.local ? formatLocal(offer.local) : formatUsd(offer.usd)

            return (
              <li key={offer.id}>
                <a
                  href={offer.url ?? '#'}
                  onClick={() => analytics.affiliateClick({
                    phone_id: phone.id,
                    phone_name: phone.display_name,
                    retailer: offer.retailer_name,
                    price: offer.usd ?? undefined,
                    location: 'detail_alternate',
                  })}
                  target="_blank"
                  rel={offer.is_placeholder ? 'noopener noreferrer nofollow' : 'noopener noreferrer sponsored'}
                  className="alt-row"
                >
                  <span style={{ minWidth: 0 }}>
                    <span className="alt-name">{offer.retailer_name}</span>
                    {offer.region && <span className="alt-region">{offer.region}</span>}
                  </span>
                  <span className="alt-price">
                    {price ?? <span style={{ fontWeight: 500, color: c.text3 }}>Search</span>}
                    <ExternalLink size={13} color={c.text3} />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <style>{`
        .alt-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.22s ease }
        .alt-panel.open { grid-template-rows: 1fr }
        .alt-panel-inner { min-height: 0; overflow: hidden; visibility: hidden; transition: visibility 0s linear 0.22s }
        .alt-panel.open .alt-panel-inner { visibility: visible; transition-delay: 0s }
        .alt-list { list-style: none; margin: 10px 0 0; padding: 0; background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden }
        .alt-list li + li { border-top: 1px solid var(--border) }
        .alt-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 16px; text-decoration: none; transition: background 0.12s }
        .alt-row:hover { background: var(--surface) }
        .alt-name { display: block; font-size: 14px; font-weight: 600; color: var(--text-1) }
        .alt-region { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 1px }
        .alt-price { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; font-size: 14px; font-weight: 700; color: var(--text-1) }
        @media (prefers-reduced-motion: reduce) { .alt-panel, .alt-panel-inner { transition: none } }
      `}</style>
    </div>
  )
}
