-- Pending staff invites for users who have not signed in yet.
-- Run in Supabase SQL Editor.

create table if not exists public.pending_staff_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('manager', 'content_manager', 'super_admin')),
  invited_by uuid,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table public.pending_staff_invites enable row level security;

drop policy if exists "super_admin_can_select_pending_invites" on public.pending_staff_invites;
create policy "super_admin_can_select_pending_invites"
on public.pending_staff_invites
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'super_admin'
  )
);

drop policy if exists "super_admin_can_insert_pending_invites" on public.pending_staff_invites;
create policy "super_admin_can_insert_pending_invites"
on public.pending_staff_invites
for insert
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'super_admin'
  )
);

drop policy if exists "super_admin_can_update_pending_invites" on public.pending_staff_invites;
create policy "super_admin_can_update_pending_invites"
on public.pending_staff_invites
for update
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'super_admin'
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'super_admin'
  )
);
