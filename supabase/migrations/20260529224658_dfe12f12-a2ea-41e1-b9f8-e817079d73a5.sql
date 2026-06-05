-- Función reutilizable para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- LEADS
-- =====================================================
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Otros',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC(2,1),
  status TEXT NOT NULL DEFAULT 'Nuevo',
  owner_name TEXT,
  next_action_at TIMESTAMPTZ,
  next_action_note TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
ON public.leads FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
ON public.leads FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
ON public.leads FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);

-- =====================================================
-- LEAD ACTIVITIES
-- =====================================================
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'nota',
  title TEXT,
  body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Función helper security definer para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.lead_belongs_to_user(_lead_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leads WHERE id = _lead_id AND user_id = _user_id
  )
$$;

CREATE POLICY "Users can view own activities"
ON public.lead_activities FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert activities on own leads"
ON public.lead_activities FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.lead_belongs_to_user(lead_id, auth.uid())
);

CREATE POLICY "Users can update own activities"
ON public.lead_activities FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
ON public.lead_activities FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_user_id ON public.lead_activities(user_id);