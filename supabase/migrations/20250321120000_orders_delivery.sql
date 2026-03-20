-- Запустите этот SQL в Supabase → SQL Editor (один раз).
-- Доставка: subtotal, shipping_fee, delivery_mode

ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_mode text DEFAULT 'courier';

COMMENT ON COLUMN orders.subtotal IS 'Сумма товаров до доставки';
COMMENT ON COLUMN orders.shipping_fee IS 'Стоимость доставки (AZN)';
COMMENT ON COLUMN orders.delivery_mode IS 'courier | pickup';

-- Realtime: в Dashboard → Database → Replication → включите публикацию для таблицы `orders`
-- (или выполните, если есть права: ALTER PUBLICATION supabase_realtime ADD TABLE orders;)
