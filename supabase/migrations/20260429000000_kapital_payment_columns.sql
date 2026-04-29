-- Kapital Bank: rename Payriff columns, add kb_status, widen payment_status, indexes.
-- Idempotent — safe to re-run.

-- 1. Rename payriff_order_id → kb_order_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payriff_order_id'
  ) THEN
    ALTER TABLE public.orders RENAME COLUMN payriff_order_id TO kb_order_id;
  END IF;
END $$;

-- 2. Rename payriff_session_id → kb_session_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payriff_session_id'
  ) THEN
    ALTER TABLE public.orders RENAME COLUMN payriff_session_id TO kb_session_id;
  END IF;
END $$;

-- 3. Raw bank status (e.g. APPROVED)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS kb_status text;

-- 4. payment_status includes cancelled (bank REVERSED/REFUNDED → cancelled)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'));

-- 5. Lookup by bank order id
CREATE INDEX IF NOT EXISTS idx_orders_kb_order_id
  ON public.orders (kb_order_id)
  WHERE kb_order_id IS NOT NULL;

-- 6. Admin filtering by delivery status
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders (status);
