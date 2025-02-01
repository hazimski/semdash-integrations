-- Create local_serp_locations table
create table if not exists public.local_serp_locations (
  id uuid default gen_random_uuid() primary key,
  code integer not null unique,
  name text not null,
  languages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for faster lookups
create index local_serp_locations_code_idx on public.local_serp_locations(code);

-- Enable RLS
alter table public.local_serp_locations enable row level security;

-- Add RLS policies
create policy "Anyone can view local SERP locations"
  on public.local_serp_locations for select
  using (true);

-- Insert initial data
insert into public.local_serp_locations (code, name, languages) values
  (9112359, 'Egypt', '[{"code": "en", "name": "English"}, {"code": "ar", "name": "Arabic"}]'),
  (2840, 'United States', '[{"code": "en", "name": "English"}, {"code": "es", "name": "Spanish"}]'),
  (2826, 'United Kingdom', '[{"code": "en", "name": "English"}]'),
  (2276, 'Germany', '[{"code": "de", "name": "German"}, {"code": "en", "name": "English"}]'),
  (2250, 'France', '[{"code": "fr", "name": "French"}, {"code": "en", "name": "English"}]'),
  (2724, 'Spain', '[{"code": "es", "name": "Spanish"}, {"code": "en", "name": "English"}]'),
  (2380, 'Italy', '[{"code": "it", "name": "Italian"}, {"code": "en", "name": "English"}]'),
  (2036, 'Australia', '[{"code": "en", "name": "English"}]'),
  (2124, 'Canada', '[{"code": "en", "name": "English"}, {"code": "fr", "name": "French"}]'),
  (2356, 'India', '[{"code": "en", "name": "English"}, {"code": "hi", "name": "Hindi"}]')
on conflict (code) do update set
  name = excluded.name,
  languages = excluded.languages;