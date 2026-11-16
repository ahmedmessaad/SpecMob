import { ADSENSE_CLIENT } from '@/lib/adConfig'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`

let scriptReady: Promise<boolean> | null = null
const requested = new WeakSet<Element>()

function afterLoadAndIdle(fn: () => void) {
  const idle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 4000 })
    else setTimeout(fn, 200)
  }
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
}

export function loadAdsScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  scriptReady ??= new Promise<boolean>(resolve => {
    afterLoadAndIdle(() => {
      const s = document.createElement('script')
      s.async = true
      s.crossOrigin = 'anonymous'
      s.src = SRC
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.head.appendChild(s)
    })
  })
  return scriptReady
}

export function requestAd(ins: Element): void {
  if (requested.has(ins)) return
  requested.add(ins)
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    requested.delete(ins)
  }
}
