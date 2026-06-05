-- Invitations table
CREATE TABLE public.role_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL,
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_role_invitations_email_status ON public.role_invitations (lower(email), status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_invitations TO authenticated;
GRANT ALL ON public.role_invitations TO service_role;

ALTER TABLE public.role_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view own invitations"
  ON public.role_invitations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid());

CREATE POLICY "Admins create invitations"
  ON public.role_invitations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid());

CREATE POLICY "Admins update own invitations"
  ON public.role_invitations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid());

CREATE POLICY "Admins delete own invitations"
  ON public.role_invitations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid());

CREATE TRIGGER trg_role_invitations_updated_at
  BEFORE UPDATE ON public.role_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to consume pending invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invite public.role_invitations%ROWTYPE;
  _assigned_role public.app_role := 'admin';
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL))
    ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.company_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  -- Look up pending invitation
  SELECT * INTO _invite
  FROM public.role_invitations
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    _assigned_role := _invite.role;
    UPDATE public.role_invitations
      SET status = 'accepted', accepted_at = now(), accepted_by = NEW.id
      WHERE id = _invite.id;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _assigned_role)
    ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.lead_categories (user_id, name, sort_order) VALUES
    (NEW.id, 'Gimnasios', 1), (NEW.id, 'Hoteles', 2), (NEW.id, 'Coworkings', 3), (NEW.id, 'Restauración', 4), (NEW.id, 'Otros', 5)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.activity_types (user_id, code, label, sort_order) VALUES
    (NEW.id, 'nota', 'Nota', 1), (NEW.id, 'llamada', 'Llamada', 2), (NEW.id, 'email', 'Email', 3), (NEW.id, 'reunion', 'Reunión', 4), (NEW.id, 'visita', 'Visita', 5)
  ON CONFLICT (user_id, code) DO NOTHING;

  RETURN NEW;
END;
$function$;
