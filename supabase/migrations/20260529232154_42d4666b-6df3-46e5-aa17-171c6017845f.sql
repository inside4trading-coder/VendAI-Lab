-- =========================
-- machines
-- =========================
CREATE TABLE public.machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  model text,
  status text NOT NULL DEFAULT 'Activa',
  lead_id uuid,
  location_label text,
  slots_total integer NOT NULL DEFAULT 30,
  installed_at date,
  last_service_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machines TO authenticated;
GRANT ALL ON public.machines TO service_role;

ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own machines" ON public.machines
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own machines" ON public.machines
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND (lead_id IS NULL OR public.lead_belongs_to_user(lead_id, auth.uid()))
  );
CREATE POLICY "Users can update own machines" ON public.machines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (lead_id IS NULL OR public.lead_belongs_to_user(lead_id, auth.uid()))
  );
CREATE POLICY "Users can delete own machines" ON public.machines
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_machines_user ON public.machines(user_id);
CREATE INDEX idx_machines_lead ON public.machines(lead_id) WHERE lead_id IS NOT NULL;

-- Helper function (created AFTER machines exists)
CREATE OR REPLACE FUNCTION public.machine_belongs_to_user(_machine_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.machines WHERE id = _machine_id AND user_id = _user_id)
$$;

-- =========================
-- machine_products
-- =========================
CREATE TABLE public.machine_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  machine_id uuid NOT NULL,
  slot_code text NOT NULL,
  product_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  stock_capacity integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (machine_id, slot_code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_products TO authenticated;
GRANT ALL ON public.machine_products TO service_role;

ALTER TABLE public.machine_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own machine products" ON public.machine_products
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own machine products" ON public.machine_products
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND public.machine_belongs_to_user(machine_id, auth.uid())
  );
CREATE POLICY "Users can update own machine products" ON public.machine_products
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own machine products" ON public.machine_products
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_machine_products_updated_at
  BEFORE UPDATE ON public.machine_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_machine_products_machine ON public.machine_products(machine_id);

-- =========================
-- machine_sales
-- =========================
CREATE TABLE public.machine_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  machine_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  sold_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_sales TO authenticated;
GRANT ALL ON public.machine_sales TO service_role;

ALTER TABLE public.machine_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own machine sales" ON public.machine_sales
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own machine sales" ON public.machine_sales
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND public.machine_belongs_to_user(machine_id, auth.uid())
  );
CREATE POLICY "Users can update own machine sales" ON public.machine_sales
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own machine sales" ON public.machine_sales
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_machine_sales_machine ON public.machine_sales(machine_id);
CREATE INDEX idx_machine_sales_sold_at ON public.machine_sales(sold_at DESC);

-- =========================
-- machine_services
-- =========================
CREATE TABLE public.machine_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  machine_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'mantenimiento',
  title text,
  body text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_services TO authenticated;
GRANT ALL ON public.machine_services TO service_role;

ALTER TABLE public.machine_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own machine services" ON public.machine_services
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own machine services" ON public.machine_services
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND public.machine_belongs_to_user(machine_id, auth.uid())
  );
CREATE POLICY "Users can update own machine services" ON public.machine_services
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own machine services" ON public.machine_services
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_machine_services_machine ON public.machine_services(machine_id);
CREATE INDEX idx_machine_services_occurred ON public.machine_services(occurred_at DESC);