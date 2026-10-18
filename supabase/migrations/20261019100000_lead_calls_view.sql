-- Llamadas de cada lead: cruce por teléfono entre leads.phone y calls_cache.
-- Se calcula al vuelo (vista), así que funciona solo para leads y llamadas nuevas sin
-- mantener ninguna columna. security_invoker: aplica la RLS de quien consulta.

-- Últimos 9 dígitos de un teléfono (número nacional en España); ignora prefijos (+34, 0034)
-- y formato (espacios, guiones, paréntesis).
CREATE OR REPLACE FUNCTION public.phone_key(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$ SELECT right(regexp_replace(coalesce(raw, ''), '\D', '', 'g'), 9) $$;

CREATE OR REPLACE VIEW public.lead_calls
WITH (security_invoker = true)
AS
WITH lead_numbers AS (
  -- Un lead puede tener varios teléfonos en el mismo campo ("917 16 23 00 / 600 11 22 33").
  SELECT DISTINCT l.id AS lead_id, l.name AS lead_name, public.phone_key(n.raw) AS key
  FROM public.leads l
  CROSS JOIN LATERAL regexp_split_to_table(coalesce(l.phone, ''), '[/,;|]|\s+(?:y|o)\s+') AS n(raw)
  WHERE length(public.phone_key(n.raw)) >= 7  -- descarta extensiones y basura
)
SELECT DISTINCT ON (ln.lead_id, c.id)
  ln.lead_id,
  ln.lead_name,
  c.id,
  c.call_start,
  c.direction,
  c.status,
  c.duration,
  c.talk_duration,
  c.sip,
  c.agent_name,
  c.caller,
  c.destination,
  c.cost,
  c.cost_currency,
  c.is_recorded,
  c.recording_url
FROM lead_numbers ln
JOIN public.calls_cache c
  ON regexp_replace(coalesce(c.destination, ''), '\D', '', 'g') LIKE '%' || ln.key
  OR regexp_replace(coalesce(c.caller, ''), '\D', '', 'g') LIKE '%' || ln.key;

GRANT SELECT ON public.lead_calls TO authenticated;
