-- Create domain_history table
create table if not exists public.domain_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  domain text not null,
  location_code text not null,
  language_code text not null,
  metrics jsonb not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index if not exists domain_history_user_id_idx on public.domain_history(user_id);
create index if not exists domain_history_domain_idx on public.domain_history(domain);
create index if not exists domain_history_created_at_idx on public.domain_history(created_at);
create index if not exists domain_history_lookup_idx on public.domain_history(domain, location_code, language_code);

-- Enable RLS
alter table public.domain_history enable row level security;

-- Add RLS policies
create policy "Users can view own domain history"
  on public.domain_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own domain history"
  on public.domain_history for insert
  with check (auth.uid() = user_id);

-- Add function to save domain history
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
  -- Delete any existing entries for this domain/location/language combination
  delete from domain_history
  where user_id = auth.uid()
    and domain = p_domain
    and location_code = p_location_code
    and language_code = p_language_code;

  -- Insert new entry
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
    p_data
  )
  returning id into v_history_id;

  return v_history_id;
end;
$$;
