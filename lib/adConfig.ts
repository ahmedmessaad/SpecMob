export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-1305053412724153'
export const AD_DEV_PLACEHOLDERS = process.env.NODE_ENV !== 'production'

export const AD_LOAD_MARGIN = '50% 0px'

export type AdSlotConfig = {
  enabled: boolean
  unit: string
  minHeight: { base: number; md: number }
}

const unit = (enabled: boolean): AdSlotConfig => ({
  enabled,
  unit: '',
  minHeight: { base: 280, md: 250 },
})

export const AD_SLOTS = {
  'category-1': unit(true),
  'category-2': unit(false),
  'phone-1': unit(true),
  'phone-2': unit(false),
  'compare-1': unit(true),
  'compare-2': unit(false),
  'brand-1': unit(true),
} as const satisfies Record<string, AdSlotConfig>

export type AdSlotId = keyof typeof AD_SLOTS
