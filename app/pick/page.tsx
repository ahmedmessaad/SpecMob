'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight, Camera, Battery, Zap, Smartphone, Feather, Monitor, Bolt,
  BadgeDollarSign, Check, Info, Gamepad2, Layers, Droplets, Waves,
  AlertTriangle, Star, Scale, RefreshCw, X, ArrowLeft, Pencil,
} from 'lucide-react'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import CompareBar from '@/app/components/CompareBar'
import { useToast } from '@/app/components/Toast'
import { api } from '@/lib/api'
import { ROUTES, MAX_COMPARE } from '@/lib/config'
import { formatUsd } from '@/lib/price'
import { c } from '@/lib/tokens'
import {
  budgetBounds, DEFAULT_DIAL_VALUE, DIAL_MAX, DIAL_MIN, PRICE_TIERS, getPriceTier,
  isPriceTierId, tierRangeText, dialRatioFromValue, dialValueFromRatio, stepDial, type PriceTierId,
} from '@/lib/priceTiers'
import { TIER_STYLE } from '@/lib/tiers'
import type { Phone, TierId } from '@/lib/types'
import { analytics } from '@/lib/analytics'

const STORE_KEY = 'specmob-dial'
const MAX_PRIORITIES = 3
const QUICK_AMOUNTS = [300, 500, 800, 1200]
const STEP_NAMES = ['Budget', 'Priorities', 'Top 5']

const PRIORITIES = [
  { id: 'camera',            label: 'Camera Quality',       short: 'Camera',      desc: 'Great photos & video',          icon: <Camera size={15} strokeWidth={1.8} /> },
  { id: 'battery',           label: 'Battery Life',         short: 'Battery',     desc: 'Last all day and beyond',       icon: <Battery size={15} strokeWidth={1.8} /> },
  { id: 'performance',       label: 'Performance',          short: 'Performance', desc: 'No lag, fast for anything',     icon: <Zap size={15} strokeWidth={1.8} /> },
  { id: 'gaming',            label: 'Gaming',               short: 'Gaming',      desc: 'Sustained high frame rates',    icon: <Gamepad2 size={15} strokeWidth={1.8} /> },
  { id: 'display',           label: 'Display Quality',      short: 'Display',     desc: 'Sharp, bright, smooth',         icon: <Monitor size={15} strokeWidth={1.8} /> },
  { id: 'value',             label: 'Best Value',           short: 'Best value',  desc: 'Most specs per dollar',         icon: <BadgeDollarSign size={15} strokeWidth={1.8} /> },
  { id: 'compact',           label: 'Compact Size',         short: 'Compact',     desc: 'Easy to use one-handed',        icon: <Smartphone size={15} strokeWidth={1.8} /> },
  { id: 'lightweight',       label: 'Lightweight',          short: 'Lightweight', desc: "Doesn't weigh you down",        icon: <Feather size={15} strokeWidth={1.8} /> },
  { id: 'smooth_display',    label: 'High Refresh Rate',    short: '120Hz+',      desc: '120Hz+ for scrolling & games',  icon: <Waves size={15} strokeWidth={1.8} /> },
  { id: 'fast_charging',     label: 'Fast Charging',        short: 'Fast charge', desc: 'Quick top-ups, less waiting',   icon: <Bolt size={15} strokeWidth={1.8} /> },
  { id: 'wireless_charging', label: 'Wireless Charging',    short: 'Wireless',    desc: 'Drop it on a pad, no cable',    icon: <Zap size={15} strokeWidth={1.8} /> },
  { id: 'foldable',          label: 'Foldable',             short: 'Foldable',    desc: 'Fold-out or flip form factor',  icon: <Layers size={15} strokeWidth={1.8} /> },
  { id: 'durability',        label: 'Water/Dust Resistant', short: 'Water proof', desc: 'Rated for rain, splashes, dust', icon: <Droplets size={15} strokeWidth={1.8} /> },
]

const PRIORITY_IDS = new Set(PRIORITIES.map(p => p.id))

interface RecommendMeta {
  budgetWidened: boolean
  insufficientMatches: boolean
  effectiveMin: number | null
}

function parseBudgetParam(raw: string | null): number | null {
  const n = Number(raw)
  return raw && Number.isFinite(n) && n >= DIAL_MIN ? Math.min(n, DIAL_MAX) : null
}

function parsePriorityParam(raw: string | null): string[] {
  if (!raw) return []
  return Array.from(new Set(raw.split(',').map(s => s.trim()).filter(id => PRIORITY_IDS.has(id)))).slice(0, MAX_PRIORITIES)
}

function readStored(): { value: number; priorities: string[] } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null')
    if (!raw || typeof raw.value !== 'number') return null
    return {
      value: Math.min(DIAL_MAX, Math.max(DIAL_MIN, raw.value)),
      priorities: Array.isArray(raw.priorities) ? parsePriorityParam(raw.priorities.join(',')) : [],
    }
  } catch {
    return null
  }
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`

function StepIntro({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="pk-intro">
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
  )
}

function DialSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const pct = dialRatioFromValue(value) * 100

  const fromX = (x: number) => {
    const el = track.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    onChange(dialValueFromRatio((x - rect.left) / rect.width))
  }

  return (
    <div
      ref={track}
      className="pk-slider"
      role="slider"
      tabIndex={0}
      aria-label="Budget"
      aria-valuemin={DIAL_MIN}
      aria-valuemax={DIAL_MAX}
      aria-valuenow={value}
      aria-valuetext={value >= DIAL_MAX ? '$2,000 and above' : `Up to $${value}`}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); dragging.current = true; fromX(e.clientX) }}
      onPointerMove={e => { if (dragging.current) fromX(e.clientX) }}
      onPointerUp={() => { dragging.current = false }}
      onPointerCancel={() => { dragging.current = false }}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(stepDial(value, 1, e.shiftKey ? 10 : 1)) }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(stepDial(value, -1, e.shiftKey ? 10 : 1)) }
      }}
    >
      <div className="pk-rail"><div className="pk-fill" style={{ width: `${pct}%` }} /></div>
      <div className="pk-thumb" style={{ left: `${pct}%` }} />
      <span className="pk-min">$100</span>
      <span className="pk-max">$2,000+</span>
    </div>
  )
}

function BudgetStep({
  budget, onBudget, activeTier, onClearTier, rangeText,
}: {
  budget: number
  onBudget: (v: number) => void
  activeTier: { name: string; range: string } | null
  onClearTier: () => void
  rangeText: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? (budget >= DIAL_MAX ? '2,000+' : budget.toLocaleString('en-US'))

  const commitDraft = () => {
    if (draft === null) return
    const n = Number(draft)
    if (draft !== '' && Number.isFinite(n)) onBudget(Math.min(DIAL_MAX, Math.max(DIAL_MIN, n)))
    setDraft(null)
  }

  return (
    <div>
      <StepIntro title="What is your budget?" sub="The most you want to spend. Type an amount or drag the dial." />

      <label className="pk-amount">
        <span className="pk-upto">Up to</span>
        <span className="pk-cur">$</span>
        <input
          className="pk-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Maximum budget in US dollars"
          value={shown}
          style={{ width: `${Math.max(3, shown.length) + 0.4}ch` }}
          onFocus={e => { setDraft(String(budget)); requestAnimationFrame(() => e.target.select()) }}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
            setDraft(digits)
            const n = Number(digits)
            if (digits && n >= DIAL_MIN) onBudget(Math.min(DIAL_MAX, n))
          }}
          onBlur={commitDraft}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
      </label>

      <DialSlider value={budget} onChange={v => { setDraft(null); onBudget(v) }} />

      <div className="pk-quick" role="group" aria-label="Quick amounts">
        {QUICK_AMOUNTS.map(q => (
          <button key={q} type="button" className={`pk-chip${!activeTier && budget === q ? ' is-on' : ''}`} onClick={() => { setDraft(null); onBudget(q) }}>
            {money(q)}
          </button>
        ))}
        <button type="button" className={`pk-chip${!activeTier && budget >= DIAL_MAX ? ' is-on' : ''}`} onClick={() => { setDraft(null); onBudget(DIAL_MAX) }}>
          No limit
        </button>
      </div>

      {activeTier ? (
        <button type="button" className="pk-tier" onClick={onClearTier}>
          <span>{activeTier.name} · {activeTier.range}</span>
          <X size={14} strokeWidth={2.2} aria-label="Switch back to an amount" />
        </button>
      ) : (
        <p className="pk-range">Showing phones priced <b>{rangeText}</b></p>
      )}
    </div>
  )
}

function PriorityStep({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const full = selected.length >= MAX_PRIORITIES

  return (
    <div>
      <StepIntro title="What matters most?" sub="Pick up to 3 and we rank the phones that are strongest in those areas first." />
      <div className="pk-chips" role="group" aria-label="Priorities">
        {PRIORITIES.map(p => {
          const on = selected.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              className={`pk-chip is-big${on ? ' is-on' : ''}`}
              aria-pressed={on}
              disabled={full && !on}
              onClick={() => onToggle(p.id)}
            >
              {p.icon}
              {p.label}
            </button>
          )
        })}
      </div>
      <p className="pk-count" aria-live="polite">
        {selected.length === 0 ? 'Optional. Skip it if you only want the best phone for the money.' : `${selected.length} of ${MAX_PRIORITIES} selected`}
      </p>
    </div>
  )
}

function ResultCard({
  phone, rank, isBest, onCompare, isCompared, budget,
}: {
  phone: Phone
  rank: number
  isBest: boolean
  onCompare: (p: Phone) => void
  isCompared: boolean
  budget: number | null
}) {
  const outOfBudget = phone.over_budget === true
  const belowRange = (phone as Phone & { below_range?: boolean }).below_range === true
  const tier = phone.tier ? TIER_STYLE[phone.tier as TierId] : null
  const why = phone.match_line ?? phone.reason ?? (tier ? `A ${tier.label} pick in your price range.` : 'In your price range.')
  const trade = outOfBudget
    ? `Priced at ${phone.price_usd != null ? money(Math.round(phone.price_usd)) : 'slightly more'}, slightly above your ${budget != null ? `${money(budget)} ` : ''}budget (within 5%).`
    : phone.tradeoff_line ?? null

  return (
    <article className={`rc${isBest ? ' is-best' : ''}`}>
      <div className="rc-top">
        <div className="rc-img">
          {phone.main_image_url
            ? <img src={phone.main_image_url} alt={phone.display_name} />
            : <Smartphone size={26} color={c.borderHover} strokeWidth={1} />}
          <span className="rc-rank" aria-label={`Rank ${rank}`}>{rank}</span>
        </div>
        <div className="rc-id">
          {isBest && <span className="rc-best"><Star size={11} fill="currentColor" strokeWidth={0} /> Best match</span>}
          <h3 className="rc-name">{phone.display_name}</h3>
          <div className="rc-meta">
            <span>{phone.brand} · {phone.release_year}</span>
            {tier && <span className="rc-tier" style={{ color: tier.color, background: tier.bg }}>{tier.label}</span>}
          </div>
        </div>
      </div>

      <p className="rc-why">{why}</p>
      {trade && (
        <p className="rc-trade">
          <Info size={14} />
          <span>{trade}</span>
        </p>
      )}

      <div className="rc-foot">
        <div className="rc-price">
          <span>{formatUsd(phone.price_usd)}</span>
          {outOfBudget && <small>Within 5% over budget</small>}
          {belowRange && <small className="is-muted">Below your range</small>}
        </div>
        <div className="rc-actions">
          <button type="button" className={`rc-btn${isCompared ? ' is-active' : ''}`} onClick={() => onCompare(phone)} aria-pressed={isCompared}>
            {isCompared ? <Check size={15} strokeWidth={2.5} /> : <Scale size={15} />}
            {isCompared ? 'In compare' : 'Compare'}
          </button>
          <Link href={phone.path} className="rc-btn is-primary">
            View specs
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function Skeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map(i => <div key={i} className="rc pk-skel" style={{ height: i === 0 ? 220 : 190 }} />)}
    </div>
  )
}

function EmptyState({
  budget, tierId, onCompare, compareIds,
}: {
  budget: number
  tierId: PriceTierId | null
  onCompare: (p: Phone) => void
  compareIds: number[]
}) {
  const [fallback, setFallback] = useState<Phone[]>([])
  const [scope, setScope] = useState<'budget' | 'all'>('budget')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let res = await api.phones.recommend(tierId ? { tier: tierId, limit: 3 } : { budget, limit: 3 })
        let s: 'budget' | 'all' = 'budget'
        if (res.phones.length === 0) {
          res = await api.phones.recommend({ limit: 3 })
          s = 'all'
        }
        if (!cancelled) { setFallback(res.phones as Phone[]); setScope(s) }
      } catch {
        if (!cancelled) setFallback([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [budget, tierId])

  return (
    <div>
      <div className="pk-state">
        <h3>No phone fits every priority</h3>
        <p>
          {fallback.length > 0
            ? scope === 'budget'
              ? 'Here are the top rated phones in this price range instead. Remove a priority or raise the budget to widen the list.'
              : 'Nothing is listed in this budget yet, so here are the top rated phones overall.'
            : loading ? 'Finding the closest picks...' : 'Try a different budget or fewer priorities.'}
        </p>
      </div>
      {fallback.map((phone, i) => (
        <ResultCard
          key={phone.id}
          phone={phone}
          rank={i + 1}
          isBest={i === 0}
          onCompare={onCompare}
          isCompared={compareIds.includes(phone.id)}
          budget={tierId ? null : budget}
        />
      ))}
    </div>
  )
}

function PickPageContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const hasLink = ['budget', 'tier'].some(k => searchParams.get(k))
  const [step, setStep] = useState<number>(() => {
    const s = parseInt(searchParams.get('step') ?? (hasLink ? '3' : '1'), 10)
    return [1, 2, 3].includes(s) ? s : 1
  })
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [budget, setBudget] = useState<number>(() => parseBudgetParam(searchParams.get('budget')) ?? DEFAULT_DIAL_VALUE)
  const [tierId, setTierId] = useState<PriceTierId | null>(() => {
    const t = searchParams.get('tier')
    return isPriceTierId(t) ? t : null
  })
  const [priorities, setPriorities] = useState<string[]>(() => parsePriorityParam(searchParams.get('p') ?? searchParams.get('priority')))
  const [ready, setReady] = useState(false)
  const [touched, setTouched] = useState(false)

  const [results, setResults] = useState<Phone[] | null>(null)
  const [meta, setMeta] = useState<RecommendMeta | null>(null)
  const [busy, setBusy] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const reported = useRef(false)
  const [comparePhones, setComparePhones] = useState<Phone[]>([])

  useEffect(() => {
    analytics.pickStart()
    const hasUrlState = ['budget', 'tier', 'p', 'priority'].some(k => searchParams.get(k))
    if (!hasUrlState) {
      const stored = readStored()
      if (stored) {
        setBudget(stored.value)
        setPriorities(stored.priorities)
      }
    }
    setReady(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ value: budget, priorities })) } catch {}
    if (!touched) return

    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      params.set('step', String(step))
      if (tierId) params.set('tier', tierId)
      else params.set('budget', String(budget))
      if (priorities.length > 0) params.set('p', priorities.join(','))
      window.history.replaceState(null, '', `/pick?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [ready, touched, step, budget, tierId, priorities])

  const priorityKey = [...priorities].sort().join(',')

  useEffect(() => {
    if (!ready || step !== 3) return
    const controller = new AbortController()
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    setBusy(true)
    setFailed(false)

    const run = (n: number) => {
      api.phones
        .recommend(
          { ...(tierId ? { tier: tierId } : { budget }), priorities: priorityKey || undefined, limit: 5 },
          controller.signal,
        )
        .then(data => {
          setResults(data.phones as Phone[])
          setMeta({
            budgetWidened: data.budget_widened,
            insufficientMatches: data.insufficient_matches,
            effectiveMin: data.effective_price_range?.min ?? null,
          })
          setBusy(false)
          if (!reported.current) {
            reported.current = true
            analytics.pickComplete({
              priorities: priorityKey,
              result_count: data.phones.length,
              max_price: data.requested_price_range?.max ?? undefined,
              min_price: data.requested_price_range?.min ?? undefined,
            })
          }
        })
        .catch(() => {
          if (controller.signal.aborted) return
          if (n < 2) {
            retryTimer = setTimeout(() => run(n + 1), 1500 * (n + 1))
            return
          }
          setFailed(true)
          setBusy(false)
        })
    }

    const timer = setTimeout(() => run(0), 200)
    return () => { clearTimeout(timer); clearTimeout(retryTimer); controller.abort() }
  }, [ready, step, tierId ? null : budget, tierId, priorityKey, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (n: number) => {
    if (n === step || n < 1 || n > 3) return
    setTouched(true)
    setDir(n > step ? 'fwd' : 'back')
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleBudget = (v: number) => { setTouched(true); setTierId(null); setBudget(v) }
  const handleTierClear = () => { setTouched(true); setTierId(null) }
  const handleToggle = (id: string) => {
    setTouched(true)
    setPriorities(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= MAX_PRIORITIES ? prev : [...prev, id])
  }
  const handleTierPick = (id: PriceTierId) => {
    setTouched(true)
    setTierId(id)
    setDir('back')
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCompare = (phone: Phone) => {
    setComparePhones(prev => {
      if (prev.find(p => p.id === phone.id)) {
        toast('Removed from compare', 'info')
        return prev.filter(p => p.id !== phone.id)
      }
      if (prev.length >= MAX_COMPARE) {
        toast(`Maximum ${MAX_COMPARE} phones in compare`, 'error')
        return prev
      }
      toast('Added to compare', 'success')
      analytics.compareAddPhone(phone, prev.length + 1)
      return [...prev, phone]
    })
  }
  const compareIds = comparePhones.map(p => p.id)

  const activeTier = tierId ? getPriceTier(tierId) : null
  const bounds = budgetBounds(budget)
  const dialRange = bounds.max == null ? `${money(bounds.min)}+` : `${money(bounds.min)} – ${money(bounds.max)}`
  const budgetLabel = activeTier ? activeTier.name : budget >= DIAL_MAX ? 'No limit' : `Up to ${money(budget)}`
  const heading = activeTier
    ? `Top 5 ${activeTier.name} phones`
    : budget >= DIAL_MAX ? 'Top 5 phones at $2,000+' : `Top 5 phones up to ${money(budget)}`
  const priorityLabels = priorities.map(id => PRIORITIES.find(p => p.id === id)?.label ?? id)
  const prioritySummary = priorityLabels.length > 0 ? priorityLabels.join(', ') : 'Any'
  const top3 = (results ?? []).filter(p => p.over_budget !== true).slice(0, 3)
  const summaries = [budgetLabel, prioritySummary, results && step === 3 && !failed ? `${results.length} phone${results.length === 1 ? '' : 's'}` : '']

  return (
    <div style={{ minHeight: '100vh', background: c.bg }}>
      <Navbar />
      <main className="pk-main">
        <div className="pk-wrap">
          <aside className="pk-rail-col">
            <h1>Which phone should you buy?</h1>
            <p className="pk-rail-sub">Two quick questions, then a ranked top 5 with the trade-offs spelled out.</p>

            <nav aria-label="Progress">
              <div className="pk-bar" aria-hidden="true"><i style={{ width: `${(step / 3) * 100}%` }} /></div>
              <ol className="pk-steps-nav">
                {STEP_NAMES.map((name, i) => {
                  const n = i + 1
                  const state = n < step ? 'is-done' : n === step ? 'is-active' : ''
                  return (
                    <li key={name} className={state}>
                      <button type="button" onClick={() => go(n)} aria-current={n === step ? 'step' : undefined}>
                        <span className="pk-num">{n < step ? <Check size={13} strokeWidth={3} /> : n}</span>
                        <span className="pk-step-text">
                          <b>{name}</b>
                          {n <= step && summaries[i] ? <small>{summaries[i]}</small> : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </aside>

          <section className="pk-stage-col" aria-live="polite">
            <div key={step} className={`pk-stage ${dir}`}>
              {step === 1 && (
                <BudgetStep
                  budget={budget}
                  onBudget={handleBudget}
                  activeTier={activeTier ? { name: activeTier.name, range: tierRangeText(activeTier) } : null}
                  onClearTier={handleTierClear}
                  rangeText={dialRange}
                />
              )}

              {step === 2 && <PriorityStep selected={priorities} onToggle={handleToggle} />}

              {step === 3 && (
                <div aria-busy={busy}>
                  <div className="pk-sticky-top">
                    <div className="pk-results-head">
                      <div style={{ minWidth: 0 }}>
                        <h2>{heading}</h2>
                        {priorityLabels.length > 0 && <p>Ranked for {priorityLabels.join(', ')}</p>}
                      </div>
                      {top3.length >= 2 && !failed && (
                        <Link href={ROUTES.comparePair(...top3.map(p => p.full_slug))} className="rc-btn is-primary pk-compare-top">
                          <Scale size={15} strokeWidth={2} />
                          Compare top {top3.length}
                        </Link>
                      )}
                    </div>

                    <div className="pk-pills">
                      <button type="button" onClick={() => go(1)}>{budgetLabel}<Pencil size={12} /></button>
                      <button type="button" onClick={() => go(2)}>{prioritySummary}<Pencil size={12} /></button>
                    </div>
                  </div>

                  {failed ? (
                    <div className="pk-state">
                      <h3>Could not load your matches</h3>
                      <p>The server may be waking up. This usually clears in a few seconds.</p>
                      <button type="button" className="rc-btn is-primary" onClick={() => setAttempt(a => a + 1)}>
                        <RefreshCw size={15} />
                        Try again
                      </button>
                    </div>
                  ) : results === null ? (
                    <Skeleton />
                  ) : (
                    <div style={{ opacity: busy ? 0.55 : 1, transition: 'opacity 0.15s' }}>
                      {meta?.insufficientMatches && results.length > 0 && (
                        <p className="pk-note is-warn">
                          <AlertTriangle size={15} />
                          <span>Only {results.length} phone{results.length !== 1 ? 's' : ''} match{results.length === 1 ? 'es' : ''} every requirement you picked. That is the full catalog for this combination right now.</span>
                        </p>
                      )}
                      {meta?.budgetWidened && !tierId && (
                        <p className="pk-note">
                          <Info size={15} />
                          <span>Not enough matches in this range, so we lowered the floor{meta.effectiveMin != null ? ` to ${money(Math.round(meta.effectiveMin))}` : ''}. Your ceiling of {bounds.max != null ? money(bounds.max) : 'no limit'} is unchanged.</span>
                        </p>
                      )}

                      {results.length === 0 ? (
                        <EmptyState budget={budget} tierId={tierId} onCompare={handleCompare} compareIds={compareIds} />
                      ) : (
                        results.map((phone, i) => (
                          <ResultCard
                            key={phone.id}
                            phone={phone}
                            rank={i + 1}
                            isBest={i === 0}
                            onCompare={handleCompare}
                            isCompared={compareIds.includes(phone.id)}
                            budget={tierId ? null : budget}
                          />
                        ))
                      )}
                    </div>
                  )}

                  <Link href={ROUTES.best} className="pk-more-link">
                    Browse the best-of lists
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>

            {step < 3 && (
              <div className="pk-actions">
                {step > 1 && (
                  <button type="button" className="rc-btn" onClick={() => go(step - 1)}>
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}
                <button type="button" className="rc-btn is-primary pk-next" onClick={() => go(step + 1)}>
                  {step === 1 ? 'Continue' : priorities.length === 0 ? 'Skip and see my top 5' : 'See my top 5'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="pk-info" aria-labelledby="pick-how-it-works">
          <h2 id="pick-how-it-works">How it works</h2>
          <p className="pk-lead">
            Not sure which phone to buy? Set what you can spend and, if you like, what matters most. You get a ranked top 5 with the trade-offs of each pick spelled out. No spec knowledge needed.
          </p>

          <ol className="pk-steps">
            <li>
              <span>1</span>
              <h3>Set your budget</h3>
              <p>Drag the dial to the most you want to spend. It works as a ceiling, with a small allowance for regional price differences.</p>
            </li>
            <li>
              <span>2</span>
              <h3>Choose priorities</h3>
              <p>Pick up to 3 things that matter, such as camera, battery or gaming. Skip it if you only want the best phone for the money.</p>
            </li>
            <li>
              <span>3</span>
              <h3>Compare your matches</h3>
              <p>See a one-line reason and trade-off for each phone, then compare your favourites side by side, up to 4 at a time.</p>
            </li>
          </ol>

          <div className="pk-cols">
            <article>
              <h2>Price tiers</h2>
              <p>Prefer a range to an exact number? Each tier groups phones that compete with each other.</p>
              <ul>
                {PRICE_TIERS.map(t => (
                  <li key={t.id}>
                    <button type="button" className="pk-linkbtn" onClick={() => handleTierPick(t.id)}>{t.name}</button>
                    {' '}({tierRangeText(t)}): {t.blurb}
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h2>What you can prioritise</h2>
              <p>Choose up to three. Some, like foldable, are strict requirements; the rest shift the ranking toward phones that are strong in those areas.</p>
              <ul>
                {PRIORITIES.map(p => (
                  <li key={p.id}><strong>{p.label}</strong>: {p.desc}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="pk-cols">
            <article>
              <h2>How are phones ranked?</h2>
              <p>
                Phones are scored the same way for every brand, and sponsors or affiliate links never change a result. Your budget sets the range, your priorities decide the order, and no brand takes more than two of the five slots. If you pick a strict requirement such as foldable, phones without it are left out.
              </p>
              <Link href={ROUTES.methodology} className="pk-textlink">Read our ranking methodology</Link>
            </article>
            <article>
              <h2>Want more options?</h2>
              <p>Explore our curated rankings for the best phones in different categories and price ranges.</p>
              <Link href={ROUTES.best} className="pk-textlink">Browse the best phone rankings <ArrowRight size={14} /></Link>
            </article>
          </div>
        </section>
      </main>
      <Footer />
      <CompareBar
        phones={comparePhones}
        onRemove={id => setComparePhones(prev => prev.filter(p => p.id !== id))}
        onClear={() => setComparePhones([])}
      />

      <style>{`
        .pk-main { max-width: 1080px; margin: 0 auto; padding: 40px 24px 96px; }
        .pk-wrap { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 64px; align-items: start; }
        .pk-rail-col { position: sticky; top: 92px; }
        .pk-rail-col h1 { font-family: var(--font-serif); font-weight: 400; font-size: clamp(30px, 3.4vw, 38px); line-height: 1.1; letter-spacing: -0.6px; color: var(--text-1); margin: 0 0 12px; }
        .pk-rail-sub { margin: 0 0 32px; font-size: 14.5px; line-height: 1.6; color: var(--text-2); }
        .pk-bar { display: none; height: 3px; margin-bottom: 14px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .pk-bar i { display: block; height: 100%; background: var(--primary); border-radius: 2px; transition: width 0.35s cubic-bezier(.2,.8,.2,1); }
        .pk-steps-nav { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
        .pk-steps-nav li { position: relative; }
        .pk-steps-nav li:not(:last-child)::after { content: ''; position: absolute; left: 15px; top: 40px; bottom: -6px; width: 2px; background: var(--border); }
        .pk-steps-nav li.is-done:not(:last-child)::after { background: var(--primary); }
        .pk-steps-nav button { display: flex; align-items: flex-start; gap: 14px; width: 100%; padding: 6px 0 14px; text-align: left; background: none; border: 0; cursor: pointer; }
        .pk-num { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--text-3); background: var(--surface); border: 1.5px solid var(--border); border-radius: 50%; transition: all 0.25s; }
        .is-active .pk-num { color: #fff; background: var(--primary); border-color: var(--primary); }
        .is-done .pk-num { color: #fff; background: var(--primary); border-color: var(--primary); }
        .pk-step-text { display: flex; flex-direction: column; gap: 2px; padding-top: 5px; min-width: 0; }
        .pk-step-text b { font-size: 14.5px; font-weight: 600; color: var(--text-3); }
        .is-active .pk-step-text b, .is-done .pk-step-text b { color: var(--text-1); }
        .pk-step-text small { font-size: 13px; color: var(--text-3); overflow-wrap: anywhere; }

        .pk-stage-col { min-width: 0; }
        .pk-stage { animation: pk-in-fwd 0.32s cubic-bezier(.2,.8,.2,1) both; }
        .pk-stage.back { animation-name: pk-in-back; }
        @keyframes pk-in-fwd { from { opacity: 0; transform: translateX(28px) } to { opacity: 1; transform: none } }
        @keyframes pk-in-back { from { opacity: 0; transform: translateX(-28px) } to { opacity: 1; transform: none } }
        .pk-intro { margin-bottom: 28px; }
        .pk-intro h2 { font-family: var(--font-serif); font-weight: 400; font-size: clamp(28px, 3.6vw, 38px); line-height: 1.1; letter-spacing: -0.5px; color: var(--text-1); margin: 0 0 10px; }
        .pk-intro p { margin: 0; font-size: 15px; line-height: 1.6; color: var(--text-2); max-width: 52ch; }

        .pk-amount { display: flex; align-items: baseline; gap: 8px; max-width: 560px; margin-bottom: 4px; cursor: text; }
        .pk-upto { font-size: 15px; font-weight: 500; color: var(--text-3); }
        .pk-cur { font-size: clamp(22px, 3vw, 28px); color: var(--text-3); font-weight: 300; }
        .pk-input { min-width: 0; padding: 0; font-family: var(--font-serif); font-size: clamp(56px, 9vw, 88px); line-height: 1.05; letter-spacing: -2px; color: var(--text-1); background: transparent; border: 0; border-bottom: 2px solid transparent; outline: none; font-variant-numeric: tabular-nums; transition: border-color 0.15s; }
        .pk-input:hover { border-bottom-color: var(--border); }
        .pk-input:focus { border-bottom-color: var(--primary); }
        .pk-slider { position: relative; height: 52px; max-width: 560px; touch-action: none; cursor: pointer; margin-top: 10px; }
        .pk-rail { position: absolute; left: 0; right: 0; top: 20px; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
        .pk-fill { height: 100%; background: var(--primary); }
        .pk-thumb { position: absolute; top: 23px; width: 28px; height: 28px; border-radius: 50%; background: var(--surface); border: 3px solid var(--primary); transform: translate(-50%, -50%); box-shadow: var(--shadow-md); }
        .pk-slider:focus-visible .pk-thumb { outline: 2px solid var(--primary); outline-offset: 3px; }
        .pk-min, .pk-max { position: absolute; top: 38px; font-size: 11.5px; color: var(--text-3); }
        .pk-max { right: 0; }
        .pk-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
        .pk-range { margin: 20px 0 0; font-size: 13.5px; color: var(--text-3); }
        .pk-range b { color: var(--text-2); font-weight: 600; }
        .pk-tier { display: inline-flex; align-items: center; gap: 10px; margin-top: 20px; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--text-1); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); cursor: pointer; }
        .pk-tier:hover { border-color: var(--primary); }

        .pk-chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .pk-chip { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; font-size: 13.5px; font-weight: 500; color: var(--text-1); background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-full); cursor: pointer; transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.1s; }
        .pk-chip.is-big { height: 46px; padding: 0 18px; font-size: 14px; }
        .pk-chip:hover:not(:disabled) { border-color: var(--primary); }
        .pk-chip:active:not(:disabled) { transform: scale(0.97); }
        .pk-chip.is-on { color: #fff; background: var(--primary); border-color: var(--primary); }
        .pk-chip:disabled { opacity: 0.4; cursor: not-allowed; }
        .pk-count { margin: 18px 0 0; font-size: 13.5px; color: var(--text-3); }

        .pk-actions { position: sticky; bottom: 0; z-index: 5; display: flex; gap: 10px; margin-top: 36px; padding: 14px 0 calc(14px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(to top, var(--bg) 72%, transparent); }
        .pk-next { flex: 0 1 auto; min-width: 200px; height: 52px; padding: 0 28px; font-size: 14.5px; }
        .pk-actions .rc-btn { height: 52px; }

        .pk-sticky-top { }
        .pk-results-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .pk-results-head h2 { font-family: var(--font-serif); font-weight: 400; font-size: clamp(26px, 3.4vw, 34px); line-height: 1.12; letter-spacing: -0.4px; color: var(--text-1); margin: 0; }
        .pk-results-head p { margin: 6px 0 0; font-size: 13.5px; color: var(--text-3); }
        .pk-pills { display: none; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .pk-pills button { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; font-size: 13px; font-weight: 500; color: var(--text-1); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); cursor: pointer; }
        .pk-pills svg { color: var(--text-3); }
        .pk-note { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 14px; padding: 12px 14px; font-size: 13px; line-height: 1.5; color: var(--text-2); background: var(--blue-light); border-radius: var(--r-md); }
        .pk-note svg { flex-shrink: 0; margin-top: 2px; color: var(--blue); }
        .pk-note.is-warn { background: rgba(231,111,81,0.07); }
        .pk-note.is-warn svg { color: var(--orange); }
        .pk-state { padding: 28px 0 24px; }
        .pk-state h3 { font-family: var(--font-serif); font-weight: 400; font-size: 24px; color: var(--text-1); margin: 0 0 8px; }
        .pk-state p { font-size: 14.5px; line-height: 1.6; color: var(--text-3); margin: 0 0 16px; max-width: 52ch; }
        .pk-more-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 14px; font-weight: 600; color: var(--text-1); text-decoration: none; }
        .pk-more-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        .pk-skel { background: linear-gradient(90deg, var(--surface) 0%, var(--bg) 50%, var(--surface) 100%); background-size: 200% 100%; animation: pk-shimmer 1.4s ease-in-out infinite; }
        @keyframes pk-shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
        .rc { position: relative; margin-bottom: 14px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); }
        .rc.is-best { border-color: var(--accent-border); background-image: linear-gradient(180deg, var(--accent-light) 0%, var(--surface) 140px); }
        .rc-top { display: flex; gap: 16px; align-items: center; }
        .rc-img { position: relative; flex-shrink: 0; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; background: var(--bg); border-radius: var(--r-md); }
        .rc.is-best .rc-img { width: 88px; height: 88px; }
        .rc-img img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
        .rc-rank { position: absolute; top: -8px; left: -8px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; background: var(--primary); border-radius: 50%; border: 2px solid var(--surface); }
        .rc-id { min-width: 0; }
        .rc-best { display: inline-flex; align-items: center; gap: 5px; margin-bottom: 4px; font-size: 12px; font-weight: 600; color: var(--accent); }
        .rc-name { font-family: var(--font-serif); font-weight: 400; font-size: 20px; line-height: 1.2; color: var(--text-1); margin: 0 0 6px; overflow-wrap: anywhere; }
        .rc.is-best .rc-name { font-size: 24px; }
        .rc-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12.5px; color: var(--text-3); }
        .rc-tier { padding: 2px 9px; font-size: 11px; font-weight: 600; border-radius: var(--r-full); }
        .rc-why { margin: 16px 0 0; font-size: 14.5px; line-height: 1.65; color: var(--text-2); }
        .rc-trade { display: flex; gap: 8px; align-items: flex-start; margin: 10px 0 0; font-size: 13px; line-height: 1.55; color: #8A4B12; }
        .rc-trade svg { flex-shrink: 0; margin-top: 2px; }
        .rc-foot { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 14px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); }
        .rc-price { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .rc-price span { font-family: var(--font-serif); font-size: 28px; line-height: 1; letter-spacing: -0.5px; color: var(--text-1); font-variant-numeric: tabular-nums; }
        .rc-price small { font-size: 11.5px; font-weight: 600; color: #8A4B12; }
        .rc-price small.is-muted { color: var(--text-3); font-weight: 500; }
        .rc-actions { display: flex; gap: 8px; }
        .rc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 18px; font-size: 13.5px; font-weight: 600; white-space: nowrap; color: var(--text-1); background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-full); cursor: pointer; text-decoration: none; transition: border-color 0.15s, background 0.15s; }
        .rc-btn:hover { border-color: var(--primary); }
        .rc-btn.is-primary { color: #fff; background: var(--primary); border-color: var(--primary); }
        .rc-btn.is-primary:hover { background: var(--primary-hover); }
        .rc-btn.is-active { color: var(--green); background: var(--green-light); border-color: var(--green-border); }
        .pk-info { margin-top: 72px; padding-top: 40px; border-top: 1px solid var(--border); }
        .pk-info h2 { font-family: var(--font-serif); font-weight: 400; font-size: clamp(24px, 3vw, 30px); color: var(--text-1); margin: 0 0 10px; }
        .pk-lead { max-width: 64ch; margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: var(--text-2); }
        .pk-steps { list-style: none; margin: 0 0 48px; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
        .pk-steps span { display: block; font-family: var(--font-serif); font-size: 40px; line-height: 1; color: var(--text-3); margin-bottom: 12px; }
        .pk-steps h3 { font-size: 16px; font-weight: 700; color: var(--text-1); margin: 0 0 6px; }
        .pk-steps p { font-size: 13.5px; line-height: 1.7; color: var(--text-2); margin: 0; }
        .pk-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; margin-bottom: 40px; align-items: start; }
        .pk-cols h2 { font-size: 22px; }
        .pk-cols p { font-size: 13.5px; line-height: 1.75; color: var(--text-2); margin: 0 0 14px; }
        .pk-cols ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .pk-cols li { font-size: 13px; line-height: 1.6; color: var(--text-2); }
        .pk-cols strong { color: var(--text-1); font-weight: 650; }
        .pk-linkbtn { padding: 0; font: inherit; font-weight: 650; color: var(--text-1); background: none; border: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
        .pk-textlink { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 650; color: var(--text-1); text-decoration: underline; text-underline-offset: 3px; }
          .rc { padding: 16px; }
          .rc-foot { grid-template-columns: minmax(0, 1fr); gap: 14px; }
          .rc-actions .rc-btn { flex: 1; }
          .pk-steps, .pk-cols { grid-template-columns: minmax(0, 1fr); gap: 28px; }
          .pk-info { margin-top: 56px; }

        @media (max-width: 920px) {
          .pk-wrap { grid-template-columns: minmax(0, 1fr); gap: 28px; }
          .pk-rail-col { position: static; }
          .pk-rail-sub { margin-bottom: 22px; }
          .pk-bar { display: block; }
          .pk-steps-nav { display: flex; gap: 0; }
          .pk-steps-nav li { flex: 1; }
          .pk-steps-nav li::after { display: none !important; }
          .pk-steps-nav button { padding: 0; gap: 8px; align-items: center; }
          .pk-num { width: 24px; height: 24px; font-size: 11.5px; }
          .pk-step-text { padding-top: 0; }
          .pk-step-text b { font-size: 13px; }
          .pk-step-text small { display: none; }
        }
        @media (max-width: 640px) {
          .pk-main { padding: 24px 16px 80px; }
          .pk-sticky-top { position: sticky; top: 56px; z-index: 10; margin: 0 -16px 16px; padding: 12px 16px 10px; background: var(--bg); border-bottom: 1px solid var(--border); }
          .pk-results-head { margin-bottom: 10px; gap: 10px; }
          .pk-results-head h2 { font-size: 22px; }
          .pk-results-head p { margin-top: 3px; font-size: 12px; }
          .pk-actions { position: fixed; left: 0; right: 0; margin: 0; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); background: var(--bg); border-top: 1px solid var(--border); }
          .pk-next { flex: 1; min-width: 0; }
          .pk-stage-col { padding-bottom: 88px; }
          .pk-pills { display: flex; margin-bottom: 0; }
          .pk-pills button { height: 32px; padding: 0 12px; font-size: 12.5px; }
          .pk-compare-top { width: 100%; }
          .rc { padding: 16px; }
          .rc-foot { grid-template-columns: minmax(0, 1fr); gap: 14px; }
          .rc-actions .rc-btn { flex: 1; }
          .pk-steps, .pk-cols { grid-template-columns: minmax(0, 1fr); gap: 28px; }
          .pk-info { margin-top: 56px; }
        }
        @media (prefers-reduced-motion: reduce) { .pk-stage, .pk-skel { animation: none } .pk-bar i { transition: none } }
      `}</style>
    </div>
  )
}

export default function PickPage() {
  return (
    <Suspense fallback={null}>
      <PickPageContent />
    </Suspense>
  )
}
