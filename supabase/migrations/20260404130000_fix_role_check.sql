-- Роли синхронизированы с ALLOWED_ROLES_IN_DB в src/lib/constants/roles.ts
-- При добавлении новой роли менять оба места (и тест roles-contract в src/lib/constants/roles-contract.test.ts).

ALTER TABLE public.pending_staff_invites
  DROP CONSTRAINT IF EXISTS pending_staff_invites_role_check;

ALTER TABLE public.pending_staff_invites
  ADD CONSTRAINT pending_staff_invites_role_check
  CHECK (
    role IN (
      'admin',
      'editor',
      'moderator',
      'super_admin',
      'support',
      'user',
      'viewer'
    )
  );
