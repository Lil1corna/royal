export type DeliveryMode = 'courier' | 'pickup'

const DEFAULT_FREE_SHIPPING = 200
const DEFAULT_COURIER_FEE = 8

function safePositiveNumber(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback
  const n = Number(raw)
  if (Number.isNaN(n) || n < 0) {
    console.warn(`[delivery] Invalid env value "${raw}", using default ${fallback}`)
    return fallback
  }
  return n
}

const FREE_SHIPPING_THRESHOLD = safePositiveNumber(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_FROM_AZN,
  DEFAULT_FREE_SHIPPING
)

const COURIER_FEE = safePositiveNumber(
  process.env.NEXT_PUBLIC_COURIER_FEE_AZN,
  DEFAULT_COURIER_FEE
)

export function calcShippingFee(
  subtotal: number,
  mode: DeliveryMode
): number {
  if (mode === 'pickup') return 0
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return COURIER_FEE
}

export function deliveryModeLabel(
  mode: DeliveryMode,
  lang: 'az' | 'ru' | 'en'
): string {
  if (mode === 'pickup') {
    return lang === 'ru' ? 'Самовывоз' : lang === 'en' ? 'Pickup' : 'Özün götür'
  }
  return lang === 'ru' ? 'Курьер' : lang === 'en' ? 'Courier' : 'Kuryer'
}

export { FREE_SHIPPING_THRESHOLD, COURIER_FEE }
