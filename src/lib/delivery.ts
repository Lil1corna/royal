export type DeliveryMode = 'courier' | 'pickup'

/** Бесплатная доставка от суммы корзины (AZN) */
const FREE_SHIPPING_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_FROM_AZN || '200'
)

/** Курьер по умолчанию (AZN), если порог не достигнут */
const COURIER_FEE = Number(process.env.NEXT_PUBLIC_COURIER_FEE_AZN || '8')

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
