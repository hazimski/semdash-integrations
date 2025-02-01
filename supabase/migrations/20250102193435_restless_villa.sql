-- Create keyword_clusters table
create table if not exists public.keyword_clusters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('semantic', 'modifier', 'topic', 'theme')),
  keywords jsonb not null,
  clusters jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index keyword_clusters_user_id_idx on public.keyword_clusters(user_id);
create index keyword_clusters_created_at_idx on public.keyword_clusters(created_at);

-- Enable RLS
alter table public.keyword_clusters enable row level security;

-- Add RLS policies
create policy "Users can view own clusters"
  on public.keyword_clusters for select
  using (auth.uid() = user_id);

create policy "Users can insert own clusters"
  on public.keyword_clusters for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own clusters"
  on public.keyword_clusters for delete
  using (auth.uid() = user_id);