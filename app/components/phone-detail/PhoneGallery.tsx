'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'
import { c } from '@/lib/tokens'
import type { PhoneDetail } from '@/lib/types'

const GALLERY_MAIN_SIZE = 340
const GALLERY_THUMB_SIZE = 56
const MAIN_PX = GALLERY_MAIN_SIZE * 2
const MAIN_PX_1X = GALLERY_MAIN_SIZE
const THUMB_PX = GALLERY_THUMB_SIZE * 2
const PRELOAD_DELAY_MS = 400

const TARGET_FILL = 0.86
const SAMPLE_PX = 96

type GalleryPhone = Pick<PhoneDetail, 'images' | 'main_image_url' | 'display_name'>

/**
 * Gallery images only. The legacy main image is used as a fallback when the
 * phone has no gallery images at all, so the page never renders empty.
 */
export function buildGalleryUrls(phone: Pick<PhoneDetail, 'images' | 'main_image_url'>): string[] {
  const gallery = Array.from(
    new Set(
      (phone.images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(img => img.url)
        .filter((url): url is string => Boolean(url) && url !== phone.main_image_url),
    ),
  )

  if (gallery.length > 0) return gallery
  return phone.main_image_url ? [phone.main_image_url] : []
}

/** Supabase public Storage URL -> resized transformation URL. Other hosts pass through. */
function resizeImageUrl(url: string, px: number): string {
  try {
    const parsed = new URL(url)
    const isSupabaseStorage =
      parsed.hostname.endsWith('.supabase.co') &&
      parsed.pathname.includes('/storage/v1/object/public/')

    if (!isSupabaseStorage) return url

    parsed.pathname = parsed.pathname.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/',
    )
    parsed.searchParams.set('width', String(px))
    parsed.searchParams.set('height', String(px))
    parsed.searchParams.set('resize', 'contain')
    parsed.searchParams.set('quality', '80')
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Fraction-of-frame normalization. Measured from the already-loaded <img>
 * on a downsampled canvas, so it costs no extra network request and almost
 * no CPU. Returns 1 when the canvas is tainted or the image is unreadable.
 */
function measureContentScale(img: HTMLImageElement): number {
  try {
    const { naturalWidth: nw, naturalHeight: nh } = img
    if (!nw || !nh) return 1

    const k = Math.min(1, SAMPLE_PX / Math.max(nw, nh))
    const w = Math.max(1, Math.round(nw * k))
    const h = Math.max(1, Math.round(nh * k))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return 1

    ctx.drawImage(img, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)

    let minX = w, minY = h, maxX = -1, maxY = -1

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const isBackground =
          data[i + 3] < 10 || (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245)
        if (isBackground) continue
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }

    if (maxX < 0) return 1

    const contentFrac = Math.max((maxX - minX + 1) / w, (maxY - minY + 1) / h)
    return Math.min(Math.max(TARGET_FILL / contentFrac, 0.6), 1.8)
  } catch {
    return 1
  }
}

interface GalleryImageProps {
  src: string
  srcSet?: string
  alt: string
  eager?: boolean
  highPriority?: boolean
  style: CSSProperties
  onScale: (scale: number) => void
  onFail: () => void
}

/**
 * Requests with CORS so the normalization can read pixels from the same
 * response that is displayed (one fetch). If the host rejects CORS, it
 * retries once without it and simply skips normalization.
 */
function GalleryImage({ src, srcSet, alt, eager, highPriority, style, onScale, onFail }: GalleryImageProps) {
  const [cors, setCors] = useState(true)
  const ref = useRef<HTMLImageElement>(null)

  const handleLoad = (el: HTMLImageElement) => {
    if (cors) onScale(measureContentScale(el))
  }
  const handleError = () => {
    if (cors) setCors(false)
    else onFail()
  }

  useEffect(() => {
    const el = ref.current
    if (!el || !el.complete) return
    if (el.naturalWidth) handleLoad(el)
    else handleError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cors])

  return (
    <img
      key={cors ? 'cors' : 'plain'}
      ref={ref}
      src={src}
      srcSet={srcSet}
      alt={alt}
      crossOrigin={cors ? 'anonymous' : undefined}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={highPriority ? 'high' : 'auto'}
      decoding="async"
      onLoad={e => handleLoad(e.currentTarget)}
      onError={handleError}
      style={style}
    />
  )
}

function preloadImage(url: string) {
  const img = new window.Image()
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  img.src = url
}

export default function PhoneGallery({ phone }: { phone: GalleryPhone }) {
  const gallery = buildGalleryUrls(phone)
  const count = gallery.length
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const [scales, setScales] = useState<Record<string, number>>({})

  const safeIndex = count ? Math.min(index, count - 1) : 0
  const current = gallery[safeIndex]
  const hasMultiple = count > 1
  const goTo = (i: number) => setIndex((i + count) % count)

  const markFailed = (url: string) => setFailed(prev => (prev[url] ? prev : { ...prev, [url]: true }))
  const setScale = (url: string, scale: number) =>
    setScales(prev => (prev[url] === scale ? prev : { ...prev, [url]: scale }))

  useEffect(() => {
    if (count < 2) return
    const targets = [gallery[safeIndex + 1], safeIndex > 0 ? gallery[safeIndex - 1] : undefined]
      .filter((url): url is string => Boolean(url))
      .map(url => resizeImageUrl(url, MAIN_PX))

    const timer = window.setTimeout(() => targets.forEach(preloadImage), PRELOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, count])

  const mainSrc = current ? resizeImageUrl(current, MAIN_PX) : ''
  const mainSrc1x = current ? resizeImageUrl(current, MAIN_PX_1X) : ''
  const mainSrcSet = mainSrc !== current ? `${mainSrc1x} 1x, ${mainSrc} 2x` : undefined

  const navButton: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: c.surface,
    border: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: c.text2,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  }

  return (
    <div
      className="gallery-card"
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--r-xl)',
        padding: 20,
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {current && !failed[current]
          ? (
            <GalleryImage
              key={current}
              src={mainSrc}
              srcSet={mainSrcSet}
              alt={phone.display_name}
              eager
              highPriority={safeIndex === 0}
              onScale={scale => setScale(current, scale)}
              onFail={() => markFailed(current)}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: GALLERY_MAIN_SIZE,
                maxHeight: GALLERY_MAIN_SIZE,
                objectFit: 'contain',
                transform: `scale(${scales[current] ?? 1})`,
                transition: 'transform 0.15s ease',
              }}
            />
          )
          : <Smartphone size={100} color={c.border} strokeWidth={0.8} />}

        {hasMultiple && (
          <>
            <button onClick={() => goTo(safeIndex - 1)} aria-label="Previous image" style={{ ...navButton, left: 4 }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => goTo(safeIndex + 1)} aria-label="Next image" style={{ ...navButton, right: 4 }}>
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          className="scrollbar-none"
          style={{ display: 'flex', gap: 8, overflowX: 'auto', minWidth: 0, width: '100%', paddingBottom: 2 }}
        >
          {gallery.map((url, i) => (
            <button
              key={url}
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === safeIndex}
              style={{
                flexShrink: 0,
                width: GALLERY_THUMB_SIZE,
                height: GALLERY_THUMB_SIZE,
                padding: 0,
                borderRadius: 'var(--r-sm)',
                border: `2px solid ${i === safeIndex ? c.accent : c.border}`,
                background: c.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              {!failed[url]
                ? (
                  <GalleryImage
                    src={resizeImageUrl(url, THUMB_PX)}
                    alt=""
                    onScale={scale => setScale(url, scale)}
                    onFail={() => markFailed(url)}
                    style={{
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                      transform: `scale(${scales[url] ?? 1})`,
                    }}
                  />
                )
                : <Smartphone size={20} color={c.border} strokeWidth={1} />}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .gallery-card { padding: 12px !important; gap: 12px !important; }
        }
      `}</style>
    </div>
  )
}
