
-- 1. Enum + tabla de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'operador', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);
CREATE POLICY "Admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id) WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

-- 2. profiles
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. company_settings
CREATE TABLE public.company_settings (
  user_id uuid PRIMARY KEY,
  name text,
  tax_id text,
  address text,
  logo_url text,
  currency text NOT NULL DEFAULT 'EUR',
  timezone text NOT NULL DEFAULT 'Europe/Madrid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own company" ON public.company_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own company" ON public.company_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own company" ON public.company_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_company_updated BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. user_preferences
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY,
  theme text NOT NULL DEFAULT 'system',
  language text NOT NULL DEFAULT 'es',
  table_density text NOT NULL DEFAULT 'comfortable',
  notify_email boolean NOT NULL DEFAULT true,
  notify_in_app boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own prefs" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prefs" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_prefs_updated BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. lead_categories
CREATE TABLE public.lead_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_categories TO authenticated;
GRANT ALL ON public.lead_categories TO service_role;
ALTER TABLE public.lead_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own lead categories" ON public.lead_categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. activity_types
CREATE TABLE public.activity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_types TO authenticated;
GRANT ALL ON public.activity_types TO service_role;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own activity types" ON public.activity_types FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. product_catalog
CREATE TABLE public.product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  default_price numeric NOT NULL DEFAULT 0,
  sku text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_catalog TO authenticated;
GRANT ALL ON public.product_catalog TO service_role;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own products" ON public.product_catalog FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.product_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Trigger autobootstrap nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL)) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.company_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.lead_categories (user_id, name, sort_order) VALUES
    (NEW.id, 'Gimnasios', 1), (NEW.id, 'Hoteles', 2), (NEW.id, 'Coworkings', 3), (NEW.id, 'Restauración', 4), (NEW.id, 'Otros', 5)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.activity_types (user_id, code, label, sort_order) VALUES
    (NEW.id, 'nota', 'Nota', 1), (NEW.id, 'llamada', 'Llamada', 2), (NEW.id, 'email', 'Email', 3), (NEW.id, 'reunion', 'Reunión', 4), (NEW.id, 'visita', 'Visita', 5)
  ON CONFLICT (user_id, code) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Backfill usuarios existentes
INSERT INTO public.profiles (user_id) SELECT id FROM auth.users ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.company_settings (user_id) SELECT id FROM auth.users ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_preferences (user_id) SELECT id FROM auth.users ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin'::public.app_role FROM auth.users ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.lead_categories (user_id, name, sort_order)
SELECT u.id, c.name, c.sort_order FROM auth.users u
CROSS JOIN (VALUES ('Gimnasios',1),('Hoteles',2),('Coworkings',3),('Restauración',4),('Otros',5)) AS c(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.lead_categories lc WHERE lc.user_id = u.id);

INSERT INTO public.activity_types (user_id, code, label, sort_order)
SELECT u.id, a.code, a.label, a.sort_order FROM auth.users u
CROSS JOIN (VALUES ('nota','Nota',1),('llamada','Llamada',2),('email','Email',3),('reunion','Reunión',4),('visita','Visita',5)) AS a(code, label, sort_order)
ON CONFLICT (user_id, code) DO NOTHING;
