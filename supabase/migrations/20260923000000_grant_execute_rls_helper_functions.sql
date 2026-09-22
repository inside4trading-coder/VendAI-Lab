-- Bug real heredado de las migraciones originales del proyecto: se revocó EXECUTE
-- de estas 3 funciones al rol `authenticated`, pero se usan DENTRO de políticas RLS
-- de tablas consultadas directamente por el frontend como `authenticated` (no vía
-- trigger) — sin EXECUTE, Postgres rechaza la consulta completa con
-- "permission denied for function X" en cuanto la política necesita evaluarlas.
--
-- Reproducido y confirmado: crear una máquina con `lead_id` (flujo "Crear máquina
-- aquí" desde un lead) fallaba con "permission denied for function
-- lead_belongs_to_user". El mismo patrón rompe:
--   - machine_products / machine_sales / machine_services (machine_belongs_to_user)
--   - gestión de roles y de invitaciones (has_role)
GRANT EXECUTE ON FUNCTION public.lead_belongs_to_user(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.machine_belongs_to_user(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
