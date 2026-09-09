-- Solicitudes del formulario de contacto público de la landing.
--
-- Se mantiene SEPARADA de la tabla `leads` del CRM:
--   * aquí escribe el rol anónimo (visitante web, sin sesión),
--   * el equipo las revisa autenticado desde el backoffice y decide
--     si las convierte en un lead del CRM.
-- Así el formulario público nunca toca la tabla del pipeline.

CREATE TABLE public.contact_requests (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  phone      TEXT,
  venue      TEXT,
  message    TEXT,
  source     TEXT        NOT NULL DEFAULT 'landing',
  status     TEXT        NOT NULL DEFAULT 'nuevo',
  handled    BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

GRANT INSERT                 ON public.contact_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.contact_requests TO authenticated;
GRANT ALL                    ON public.contact_requests TO service_role;

-- El público solo puede INSERTAR, y con validación básica de formato/longitud.
-- (No sustituye a un CAPTCHA / rate-limit: ver nota en el PR.)
CREATE POLICY "Anyone can submit a contact request"
ON public.contact_requests FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name)  BETWEEN 1 AND 200
  AND char_length(email) BETWEEN 3 AND 320
  AND position('@' IN email) > 1
  AND (phone   IS NULL OR char_length(phone)   <= 40)
  AND (venue   IS NULL OR char_length(venue)   <= 80)
  AND (message IS NULL OR char_length(message) <= 4000)
);

-- El equipo (autenticado) puede leer y actualizar el estado.
CREATE POLICY "Authenticated can read contact requests"
ON public.contact_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can update contact requests"
ON public.contact_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX idx_contact_requests_created_at ON public.contact_requests (created_at DESC);
CREATE INDEX idx_contact_requests_status     ON public.contact_requests (status);
