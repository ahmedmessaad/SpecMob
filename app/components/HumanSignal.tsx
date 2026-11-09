'use client'
import { useEffect } from 'react'
import { isLikelyBot } from '@/lib/bot'

const SIGNALS = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const
const KEY = 'sm-human-signal'

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void

export default function HumanSignal() {
  useEffect(() => {
    if (isLikelyBot() || !navigator.languages?.length) return
    try {
      if (sessionStorage.getItem(KEY)) return
    } catch {}

    const ac = new AbortController()
    const onSignal = (e: Event) => {
      if (!e.isTrusted) return
      ac.abort()
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {}
      ;(window as Window & { gtag?: Gtag }).gtag?.('event', 'human_signal', { signal: e.type })
    }
    for (const s of SIGNALS) window.addEventListener(s, onSignal, { passive: true, signal: ac.signal })
    return () => ac.abort()
  }, [])

  return null
}
