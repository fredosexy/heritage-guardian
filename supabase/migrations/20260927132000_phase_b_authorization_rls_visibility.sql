-- Phase B RLS convergence: authorization record creators must be able to inspect
-- the rows they created, while all writes remain RPC-only.

DROP POLICY IF EXISTS "users view own role assignments" ON public.role_assignments;
CREATE POLICY "role assignment parties view"
ON public.role_assignments FOR SELECT TO authenticated
USING(
  user_id=auth.uid()
  OR assigned_by=auth.uid()
  OR public.has_role(auth.uid(),'admin')
);

DROP POLICY IF EXISTS "users view own permission grants" ON public.permission_grants;
CREATE POLICY "permission grant parties view"
ON public.permission_grants FOR SELECT TO authenticated
USING(
  user_id=auth.uid()
  OR granted_by=auth.uid()
  OR public.has_role(auth.uid(),'admin')
);

DROP POLICY IF EXISTS "users view own permission denies" ON public.permission_denies;
CREATE POLICY "permission deny parties view"
ON public.permission_denies FOR SELECT TO authenticated
USING(
  user_id=auth.uid()
  OR denied_by=auth.uid()
  OR public.has_role(auth.uid(),'admin')
);
