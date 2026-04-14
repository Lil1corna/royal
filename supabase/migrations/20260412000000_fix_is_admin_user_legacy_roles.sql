-- Fix is_admin_user() to recognize all admin-level roles (admin, manager, super_admin, moderator).
-- The original only matched role='admin', missing legacy 'manager' and 'moderator' roles.

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
      and u.role in ('admin', 'manager', 'super_admin', 'moderator')
  );
$$;

-- Also fix pending_staff_invites RLS to include new roles
-- (super_admin check is fine, but we need admin to also manage some invites)

-- Fix orders RLS: allow admin-level roles to delete orders
-- The existing delete policy already uses is_admin_user(), which now covers all admin roles.

-- Fix orders: add admin-level update policy for status changes
drop policy if exists "orders_update_admin_status" on public.orders;
create policy "orders_update_admin_status"
on public.orders
for update
using (
  public.is_admin_user()
)
with check (
  public.is_admin_user()
);
