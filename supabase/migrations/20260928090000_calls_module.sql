-- Módulo Llamadas: caché de llamadas de Zadarma y mapeo extensión SIP -> agente.
-- Portado de basicosystems. Lectura compartida por todo el equipo (igual que el CRM);
-- la escritura en calls_cache la hace solo la edge function zadarma-sync con service role.

CREATE TABLE public.calls_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id text UNIQUE NOT NULL,
  pbx_call_id text,
  call_start timestamptz,
  call_end timestamptz,
  caller text,
  destination text,
  direction text,            -- 'incoming' | 'outgoing' | 'internal'
  status text,               -- 'answered' | 'no_answer' | 'busy' | 'missed'
  duration integer NOT NULL DEFAULT 0,       -- segundos totales
  talk_duration integer NOT NULL DEFAULT 0,  -- segundos hablados
  sip text,
  agent_name text,
  cost numeric NOT NULL DEFAULT 0,
  is_recorded boolean NOT NULL DEFAULT false,
  recording_url text,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX calls_cache_call_start_idx ON public.calls_cache (call_start DESC);

ALTER TABLE public.calls_cache ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.calls_cache TO authenticated;
GRANT ALL ON public.calls_cache TO service_role;

CREATE POLICY "Team can read calls"
  ON public.calls_cache FOR SELECT TO authenticated
  USING (true);

CREATE TABLE public.sip_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sip_id text UNIQUE NOT NULL,
  agent_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sip_agents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sip_agents TO authenticated;
GRANT ALL ON public.sip_agents TO service_role;

CREATE POLICY "Team can read sip_agents"
  ON public.sip_agents FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage sip_agents"
  ON public.sip_agents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
