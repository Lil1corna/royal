-- Enable and harden RLS for core tables.
-- NOTE: This migration assumes `public.users` contains role column with value 'admin' for administrators.

-- Helper to avoid recursive policy checks on `public.users`.
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to anon, authenticated;

-- ======================
-- orders
-- ======================
alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
with check (auth.uid() = user_id);

drop policy if exists "orders_update_own_without_status_change" on public.orders;
create policy "orders_update_own_without_status_change"
on public.orders
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and status = (
    select o.status
    from public.orders o
    where o.id = orders.id
  )
);

drop policy if exists "orders_delete_admin_only" on public.orders;
create policy "orders_delete_admin_only"
on public.orders
for delete
using (public.is_admin_user());

-- ======================
-- order_items
-- ======================
alter table public.order_items enable row level security;

drop policy if exists "order_items_select_own_order" on public.order_items;
create policy "order_items_select_own_order"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

-- No insert/update/delete policies intentionally:
-- direct client writes are blocked; mutations should go through SECURITY DEFINER RPC.

-- ======================
-- products
-- ======================
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products
for select
using (true);

drop policy if exists "products_insert_admin_only" on public.products;
create policy "products_insert_admin_only"
on public.products
for insert
with check (public.is_admin_user());

drop policy if exists "products_update_admin_only" on public.products;
create policy "products_update_admin_only"
on public.products
for update
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "products_delete_admin_only" on public.products;
create policy "products_delete_admin_only"
on public.products
for delete
using (public.is_admin_user());

-- ======================
-- users (profiles table)
-- ======================
alter table public.users enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin"
on public.users
for select
using (auth.uid() = id or public.is_admin_user());

drop policy if exists "users_update_self_only" on public.users;
create policy "users_update_self_only"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users_delete_admin_only" on public.users;
create policy "users_delete_admin_only"
on public.users
for delete
using (public.is_admin_user());

-- ======================
-- pending_staff_invites (add delete policy)
-- ======================
alter table public.pending_staff_invites enable row level security;

drop policy if exists "pending_staff_invites_delete_admin_only" on public.pending_staff_invites;
create policy "pending_staff_invites_delete_admin_only"
on public.pending_staff_invites
for delete
using (public.is_admin_user());
