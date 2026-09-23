-- CRM compartido por equipo — puerto de la estructura de pipeline de
-- basicosystems (github.com/inside4trading-coder/basicosystems,
-- supabase/migrations/20260915224746_pipeline_schema.sql), adaptada al
-- esquema `leads` existente de VendAI en vez de crear una tabla `deals`
-- nueva (menos cambio, mismo resultado).
--
-- Antes: RLS de `leads`/`lead_activities` aislaba por creador
-- (auth.uid() = user_id) — con 3 cuentas de equipo separadas, cada
-- persona solo vería lo que ella misma creó. Ahora: cualquier usuario
-- autenticado ve y gestiona todos los leads del equipo (pipeline
-- compartido), igual que en basicosystems.

-- === LEADS: columnas nuevas ===
ALTER TABLE public.leads
  ADD COLUMN assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}'::text[];

-- === LEADS: RLS compartida ===
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

CREATE POLICY "Team can view all leads"
  ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can create leads"
  ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Team can update all leads"
  ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete all leads"
  ON public.leads FOR DELETE TO authenticated USING (true);

-- === LEAD_ACTIVITIES: RLS compartida ===
DROP POLICY IF EXISTS "Users can view own activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can insert activities on own leads" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.lead_activities;

CREATE POLICY "Team can view all activities"
  ON public.lead_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can create activities"
  ON public.lead_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Team can update all activities"
  ON public.lead_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete all activities"
  ON public.lead_activities FOR DELETE TO authenticated USING (true);

-- === MACHINES: el check de "lead propio" ya no aplica (leads son compartidos) ===
DROP POLICY IF EXISTS "Users can insert own machines" ON public.machines;
DROP POLICY IF EXISTS "Users can update own machines" ON public.machines;

CREATE POLICY "Users can insert own machines" ON public.machines
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND (lead_id IS NULL OR EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id))
  );
CREATE POLICY "Users can update own machines" ON public.machines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (lead_id IS NULL OR EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id))
  );

-- === Directorio de equipo para asignar leads ===
-- SECURITY DEFINER porque los clientes normales no pueden leer auth.users.
-- Solo expone id/email/full_name, y solo a `authenticated` (no `anon`).
CREATE OR REPLACE FUNCTION public.list_team_members()
RETURNS TABLE (id uuid, email text, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email::text, p.full_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  ORDER BY COALESCE(p.full_name, u.email);
$$;

REVOKE EXECUTE ON FUNCTION public.list_team_members() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_team_members() TO authenticated;
