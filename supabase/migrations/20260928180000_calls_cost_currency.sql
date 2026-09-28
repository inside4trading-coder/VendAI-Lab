-- Moneda en la que Zadarma factura cada llamada (p. ej. USD, EUR). El coste viene
-- de /v1/statistics/ cruzado con la llamada de la centralita en zadarma-sync.
ALTER TABLE public.calls_cache ADD COLUMN cost_currency text;
