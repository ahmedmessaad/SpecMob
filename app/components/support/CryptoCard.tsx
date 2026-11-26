'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { c } from '@/lib/tokens'
import type { CryptoAddress } from '@/lib/supportData'

export default function CryptoCard({ entries }: { entries: CryptoAddress[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopied(address)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div style={{ borderTop: `1px solid ${c.border}` }}>
      {entries.map(e => (
        <div
          key={e.network}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${c.border}` }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: c.text3, marginBottom: 3 }}>
              {e.label} · {e.network}
            </div>
            <div style={{ fontSize: 12.5, color: c.text1, fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
              {e.address}
            </div>
          </div>
          <button
            onClick={() => copy(e.address)}
            aria-label={`Copy ${e.network} address`}
            style={{ display: 'flex', color: copied === e.address ? 'var(--green)' : c.text3, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            {copied === e.address ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      ))}
      <p style={{ fontSize: 11, color: c.text3, marginTop: 4 }}>
        Double-check the network before sending — USDT on the wrong chain cannot be recovered.
      </p>
    </div>
  )
}
