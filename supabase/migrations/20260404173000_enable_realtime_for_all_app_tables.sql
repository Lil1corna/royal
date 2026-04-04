-- Ensure Supabase Realtime publication is enabled for app tables.
-- This keeps UI live-updating across catalog, account, cart and admin pages.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'products'
    ) then
      execute 'alter publication supabase_realtime add table public.products';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'product_sizes'
    ) then
      execute 'alter publication supabase_realtime add table public.product_sizes';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
    ) then
      execute 'alter publication supabase_realtime add table public.orders';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_items'
    ) then
      execute 'alter publication supabase_realtime add table public.order_items';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'users'
    ) then
      execute 'alter publication supabase_realtime add table public.users';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pending_staff_invites'
    ) then
      execute 'alter publication supabase_realtime add table public.pending_staff_invites';
    end if;
  end if;
end;
$$;
