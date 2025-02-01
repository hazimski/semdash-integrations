-- Add RLS policies for domain_history table
drop policy if exists "Users can view own domain history" on domain_history;
drop policy if exists "Users can insert own domain history" on domain_history;

-- Create new RLS policies with proper user isolation
create policy "Users can view own domain history"
  on domain_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own domain history"
  on domain_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own domain history"
  on domain_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own domain history"
  on domain_history for delete
  using (auth.uid() = user_id);

-- Add index for faster user-specific queries
create index if not exists domain_history_user_lookup_idx 
on domain_history(user_id, created_at desc);

-- Add function to cleanup old history entries
create or replace function cleanup_old_domain_history()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from domain_history
  where created_at < now() - interval '30 days';
end;
$$;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- select cron.schedule('cleanup-domain-history', '0 0 * * *', 'select cleanup_old_domain_history()');