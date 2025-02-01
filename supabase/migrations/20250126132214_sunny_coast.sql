-- Create short_urls table
create table if not exists public.short_urls (
  id uuid default gen_random_uuid() primary key,
  short_code text unique not null,
  original_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (now() + interval '7 days') not null
);

-- Add indexes
create index short_urls_short_code_idx on public.short_urls(short_code);
create index short_urls_expires_at_idx on public.short_urls(expires_at);

-- Enable RLS
alter table public.short_urls enable row level security;

-- Add RLS policies
create policy "Anyone can view unexpired short URLs"
  on public.short_urls for select
  using (expires_at > now());

create policy "Authenticated users can create short URLs"
  on public.short_urls for insert
  with check (auth.role() = 'authenticated');

-- Add function to cleanup expired URLs
create or replace function cleanup_expired_short_urls()
returns void
language plpgsql security definer
as $$
begin
  delete from short_urls where expires_at <= now();
end;
$$;