/** Допустимые статусы заказа (совпадают с админкой и БД) */
export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'in_delivery',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Порядок «в пути» к доставке (без cancelled) */
export const ACTIVE_FLOW: OrderStatus[] = [
  'new',
  'confirmed',
  'in_delivery',
  'delivered',
]

export function isOrderStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s)
}

/** Следующий статус по кнопке в админке */
export const ADMIN_NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: 'confirmed',
  confirmed: 'in_delivery',
  in_delivery: 'delivered',
}
