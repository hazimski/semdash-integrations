-- Create local_serp_history table
create table if not exists public.local_serp_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  keyword text not null,
  location_code integer not null,
  language_code text not null,
  device text not null,
  os text not null,
  results jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index local_serp_history_user_id_idx on public.local_serp_history(user_id);
create index local_serp_history_created_at_idx on public.local_serp_history(created_at);
create index local_serp_history_keyword_idx on public.local_serp_history(keyword);

-- Enable RLS
alter table public.local_serp_history enable row level security;

-- Add RLS policies
create policy "Users can view own local SERP history"
  on public.local_serp_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own local SERP history"
  on public.local_serp_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own local SERP history"
  on public.local_serp_history for delete
  using (auth.uid() = user_id);

-- Add function to cleanup old history entries
create or replace function cleanup_old_local_serp_history()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from local_serp_history
  where created_at < now() - interval '30 days';
end;
$$;