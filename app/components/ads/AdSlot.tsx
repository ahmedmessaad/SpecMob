'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ADS_ENABLED, ADSENSE_CLIENT, AD_DEV_PLACEHOLDERS, AD_LOAD_MARGIN, AD_SLOTS,
  type AdSlotConfig, type AdSlotId,
} from '@/lib/adConfig'
import { loadAdsScript, requestAd } from '@/lib/adsLoader'
import { c, f } from '@/lib/tokens'

type Status = 'pending' | 'filled' | 'unfilled'

function LiveSlot({ id, cfg }: { id: AdSlotId; cfg: AdSlotConfig }) {
  const wrapRef = useRef<HTMLElement>(null)
  const insRef = useRef<HTMLModElement>(null)
  const [status, setStatus] = useState<Status>('pending')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const ins = insRef.current
    if (!wrap || !ins) return

    let inView = false
    let collapsePending = false

    const collapse = () => {
      if (inView) collapsePending = true
      else setCollapsed(true)
    }

    const loadIo = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      loadIo.disconnect()
      void loadAdsScript().then(ok => {
        if (!ok) {
          setStatus('unfilled')
          collapse()
          return
        }
        requestAd(ins)
      })
    }, { rootMargin: AD_LOAD_MARGIN })

    const viewIo = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting
      if (!inView && collapsePending) setCollapsed(true)
    })

    const statusMo = new MutationObserver(() => {
      const s = ins.getAttribute('data-ad-status')
      if (s === 'filled') setStatus('filled')
      else if (s === 'unfilled') {
        setStatus('unfilled')
        collapse()
      }
    })

    loadIo.observe(wrap)
    viewIo.observe(wrap)
    statusMo.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] })

    return () => {
      loadIo.disconnect()
      viewIo.disconnect()
      statusMo.disconnect()
    }
  }, [])

  return (
    <aside
      ref={wrapRef}
      aria-label="Advertisement"
      data-ad-slot-id={id}
      className="ad-slot"
      style={{
        '--ad-h-base': `${cfg.minHeight.base}px`,
        '--ad-h-md': `${cfg.minHeight.md}px`,
        display: collapsed ? 'none' : 'block',
        margin: '32px 0',
      } as React.CSSProperties}
    >
      <span
        style={{
          display: 'block', marginBottom: 6, fontFamily: f.sans, fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.6px', textTransform: 'uppercase', color: c.text3,
          visibility: status === 'filled' ? 'visible' : 'hidden',
        }}
      >
        Advertisement
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={cfg.unit}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}

function DevPlaceholder({ id, cfg }: { id: AdSlotId; cfg: AdSlotConfig }) {
  return (
    <div
      className="ad-slot"
      style={{
        '--ad-h-base': `${cfg.minHeight.base}px`,
        '--ad-h-md': `${cfg.minHeight.md}px`,
        margin: '32px 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px dashed ${c.border}`, borderRadius: 'var(--r-md)',
        fontSize: 12, color: c.text3,
      } as React.CSSProperties}
    >
      {id}
    </div>
  )
}

export default function AdSlot({ id }: { id: AdSlotId }) {
  if (!ADS_ENABLED) return null
  const cfg = AD_SLOTS[id]
  if (!cfg.enabled) return null
  if (!cfg.unit) return AD_DEV_PLACEHOLDERS ? <DevPlaceholder id={id} cfg={cfg} /> : null
  return <LiveSlot id={id} cfg={cfg} />
}
