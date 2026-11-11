-- Althea: limpieza automática de fotos viejas (60 días).
-- Ya está aplicado en Supabase. Queda acá como referencia.
-- La función de borrado está en supabase/functions/limpiar-fotos.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Visitas de antes de p_corte que todavía tienen alguna foto (generales o de la lista).
create or replace function public.visitas_con_fotos_vencidas(p_corte timestamptz)
returns table (id uuid, fotos jsonb, items jsonb)
language sql stable security definer set search_path = public as $$
  select v.id, v.fotos, v.items from public.visitas v
  where v.inicio < p_corte
    and (jsonb_array_length(coalesce(v.fotos, '[]')) > 0
         or exists (select 1 from jsonb_array_elements(coalesce(v.items, '[]')) e
                    where jsonb_array_length(coalesce(e->'fotos', '[]')) > 0))
  order by v.inicio
  limit 100;
$$;
revoke all on function public.visitas_con_fotos_vencidas(timestamptz) from public, anon, authenticated;
grant execute on function public.visitas_con_fotos_vencidas(timestamptz) to service_role;

-- Todas las noches a las 4:15 (hora de Salta) = 7:15 UTC.
select cron.schedule(
  'limpiar-fotos-viejas',
  '15 7 * * *',
  $$ select net.http_post(
       url := 'https://udsyvhxobhinjooxhtma.supabase.co/functions/v1/limpiar-fotos',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb,
       timeout_milliseconds := 60000
     ) $$
);
