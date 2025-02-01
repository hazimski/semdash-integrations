-- Create domain_overviews table
create table if not exists public.domain_overviews (
  id uuid default gen_random_uuid() primary key,
  domain text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index domain_overviews_domain_idx on public.domain_overviews(domain);
create index domain_overviews_created_at_idx on public.domain_overviews(created_at);

-- Add unique constraint on domain
create unique index domain_overviews_domain_unique_idx on public.domain_overviews(lower(domain));

-- Enable RLS
alter table public.domain_overviews enable row level security;

-- Add RLS policies
create policy "Anyone can view domain overviews"
  on public.domain_overviews for select
  using (true);

create policy "Authenticated users can insert domain overviews"
  on public.domain_overviews for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update domain overviews"
  on public.domain_overviews for update
  using (auth.role() = 'authenticated');

-- Add function to save/update domain overview
create or replace function public.save_domain_overview(
  p_domain text,
  p_data jsonb
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_overview_id uuid;
begin
  insert into domain_overviews (
    domain,
    data
  ) values (
    lower(p_domain),
    p_data
  )
  on conflict (lower(domain))
  do update set
    data = excluded.data,
    updated_at = now()
  returning id into v_overview_id;

  return v_overview_id;
end;
$$;