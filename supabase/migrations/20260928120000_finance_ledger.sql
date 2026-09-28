-- Finanzas · Ledger: réplica de la hoja "VENDING MACHINE PROJECT — Ledger".
-- Movimientos de caja del equipo (ingresos/egresos en USD o EUR) y tipo de cambio
-- EUR→USD compartido. Visible y editable por todo el equipo, como el CRM.

CREATE TABLE public.finance_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_on date NOT NULL DEFAULT current_date,
  member_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('ingreso', 'egreso')),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX finance_movements_occurred_on_idx ON public.finance_movements (occurred_on, created_at);

ALTER TABLE public.finance_movements ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_movements TO authenticated;
GRANT ALL ON public.finance_movements TO service_role;

CREATE POLICY "Team can read finance movements"
  ON public.finance_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can insert finance movements"
  ON public.finance_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Team can update finance movements"
  ON public.finance_movements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete finance movements"
  ON public.finance_movements FOR DELETE TO authenticated USING (true);

-- Configuración única (una fila): tipo de cambio EUR→USD de la hoja "Config".
CREATE TABLE public.finance_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  eur_usd_rate numeric(10, 4) NOT NULL DEFAULT 1.08 CHECK (eur_usd_rate > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id)
);

ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.finance_settings TO authenticated;
GRANT ALL ON public.finance_settings TO service_role;

CREATE POLICY "Team can read finance settings"
  ON public.finance_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can update finance settings"
  ON public.finance_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.finance_settings (id, eur_usd_rate) VALUES (true, 1.08);
