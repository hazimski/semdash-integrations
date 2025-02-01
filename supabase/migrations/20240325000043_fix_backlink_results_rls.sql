-- Drop existing RLS policies for backlink_results if they exist
drop policy if exists "Users can view own backlink results" on public.backlink_results;
drop policy if exists "Users can insert own backlink results" on public.backlink_results;
drop policy if exists "Users can update own backlink results" on public.backlink_results;
drop policy if exists "Users can delete own backlink results" on public.backlink_results;

-- Enable RLS on backlink_results table
alter table public.backlink_results enable row level security;

-- Create RLS policies for backlink_results
create policy "Users can view own backlink results"
  on public.backlink_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own backlink results"
  on public.backlink_results for insert
  with check (auth.uid() = user_id);

create policy "Users can update own backlink results"
  on public.backlink_results for update
  using (auth.uid() = user_id);

create policy "Users can delete own backlink results"
  on public.backlink_results for delete
  using (auth.uid() = user_id);

-- Add index for faster user-specific queries
create index if not exists backlink_results_user_lookup_idx 
on public.backlink_results(user_id, created_at desc);

-- Add function to cleanup old backlink results
create or replace function cleanup_old_backlink_results()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from backlink_results
  where created_at < now() - interval '30 days';
end;
$$;