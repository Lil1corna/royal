-- Align is_admin_user() with DB roles used for staff (see src/config/roles.ts DB_ROLE_ALIASES).
-- Previous migration omitted editor + content_manager, so RLS blocked direct PostgREST
-- mutations for those roles if ever used without the service-role client.

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
      and lower(trim(u.role::text)) in (
        'super_admin',
        'admin',
        'manager',
        'moderator',
        'editor',
        'content_manager'
      )
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to anon, authenticated;

-- pending_staff_invites: restore legacy invite roles + customer; keep in sync with INVITE_ALLOWED_ROLE_INPUTS.
alter table public.pending_staff_invites
  drop constraint if exists pending_staff_invites_role_check;

alter table public.pending_staff_invites
  add constraint pending_staff_invites_role_check
  check (
    lower(trim(role::text)) in (
      'super_admin',
      'admin',
      'manager',
      'moderator',
      'editor',
      'content_manager',
      'support',
      'viewer',
      'user',
      'customer'
    )
  );

-- product_sizes: enable RLS + catalog read / staff write (table may exist from Dashboard or earlier SQL).
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'product_sizes'
  ) then
    execute 'alter table public.product_sizes enable row level security';

    execute 'drop policy if exists "product_sizes_select_public" on public.product_sizes';
    execute $p$
      create policy "product_sizes_select_public"
      on public.product_sizes
      for select
      using (true)
    $p$;

    execute 'drop policy if exists "product_sizes_insert_admin" on public.product_sizes';
    execute $p$
      create policy "product_sizes_insert_admin"
      on public.product_sizes
      for insert
      with check (public.is_admin_user())
    $p$;

    execute 'drop policy if exists "product_sizes_update_admin" on public.product_sizes';
    execute $p$
      create policy "product_sizes_update_admin"
      on public.product_sizes
      for update
      using (public.is_admin_user())
      with check (public.is_admin_user())
    $p$;

    execute 'drop policy if exists "product_sizes_delete_admin" on public.product_sizes';
    execute $p$
      create policy "product_sizes_delete_admin"
      on public.product_sizes
      for delete
      using (public.is_admin_user())
    $p$;
  end if;
end;
$$;
