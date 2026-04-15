-- One-time cleanup: remove all orders and line items from the database.
-- Apply via Supabase Dashboard → SQL, or `supabase db push` when linked.
-- Safe order: children first (FK to public.orders).

delete from public.order_items;
delete from public.orders;
