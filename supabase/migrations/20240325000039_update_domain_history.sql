-- Add unique constraint to prevent duplicate entries per user
alter table public.domain_history
add constraint domain_history_user_domain_unique 
unique (user_id, domain, location_code, language_code);

-- Update save_domain_history function to handle conflicts
create or replace function public.save_domain_history(
  p_domain text,
  p_location_code text,
  p_language_code text,
  p_metrics jsonb,
  p_data jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_history_id uuid;
begin
  -- Insert new entry or update existing one
  insert into domain_history (
    user_id,
    domain,
    location_code,
    language_code,
    metrics,
    data
  ) values (
    auth.uid(),
    p_domain,
    p_location_code,
    p_language_code,
    p_metrics,
    coalesce(p_data, '{}'::jsonb)
  )
  on conflict (user_id, domain, location_code, language_code)
  do update set
    metrics = excluded.metrics,
    data = excluded.data,
    created_at = now()
  returning id into v_history_id;

  return v_history_id;
end;
$$;

-- Add function to get domain history by user
create or replace function public.get_user_domain_history(
  p_limit int default 10
)
returns table (
  id uuid,
  domain text,
  location_code text,
  language_code text,
  metrics jsonb,
  data jsonb,
  created_at timestamptz
)
language sql security definer set search_path = public
as $$
  select 
    id,
    domain,
    location_code,
    language_code,
    metrics,
    data,
    created_at
  from domain_history
  where user_id = auth.uid()
  order by created_at desc
  limit p_limit;
$$;
