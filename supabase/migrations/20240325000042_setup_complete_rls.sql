-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_invites enable row level security;
alter table public.credits_history enable row level security;
alter table public.backlink_results enable row level security;
alter table public.domain_history enable row level security;
alter table public.shared_domain_history enable row level security;
alter table public.keyword_lists enable row level security;
alter table public.list_keywords enable row level security;

-- Users table policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Teams table policies
create policy "Team members can view their team"
  on public.teams for select
  using (
    exists (
      select 1 from public.users
      where users.team_id = teams.id
      and users.id = auth.uid()
    )
  );

create policy "Team owners can update their team"
  on public.teams for update
  using (
    exists (
      select 1 from public.users
      where users.team_id = teams.id
      and users.id = auth.uid()
      and users.role = 'owner'
    )
  );

create policy "Authenticated users can create teams"
  on public.teams for insert
  with check (auth.uid() = owner_id);

create policy "Team owners can delete their team"
  on public.teams for delete
  using (
    exists (
      select 1 from public.users
      where users.team_id = teams.id
      and users.id = auth.uid()
      and users.role = 'owner'
    )
  );

-- Team invites policies
create policy "Team admins can view invites"
  on public.team_invites for select
  using (
    exists (
      select 1 from public.users
      where users.team_id = team_invites.team_id
      and users.id = auth.uid()
      and users.role in ('owner', 'admin')
    )
  );

create policy "Team admins can create invites"
  on public.team_invites for insert
  with check (
    exists (
      select 1 from public.users
      where users.team_id = team_invites.team_id
      and users.id = auth.uid()
      and users.role in ('owner', 'admin')
    )
  );

create policy "Team admins can delete invites"
  on public.team_invites for delete
  using (
    exists (
      select 1 from public.users
      where users.team_id = team_invites.team_id
      and users.id = auth.uid()
      and users.role in ('owner', 'admin')
    )
  );

-- Credits history policies
create policy "Users can view own credit history"
  on public.credits_history for select
  using (auth.uid() = user_id);

create policy "System can insert credit history"
  on public.credits_history for insert
  with check (auth.uid() = user_id);

-- Backlink results policies
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

-- Domain history policies
create policy "Users can view own domain history"
  on public.domain_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own domain history"
  on public.domain_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own domain history"
  on public.domain_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own domain history"
  on public.domain_history for delete
  using (auth.uid() = user_id);

-- Shared domain history policies
create policy "Anyone can view unexpired shared links"
  on public.shared_domain_history for select
  using (expires_at > now());

create policy "Users can create shared links for own history"
  on public.shared_domain_history for insert
  with check (
    exists (
      select 1 from public.domain_history
      where id = domain_history_id
      and user_id = auth.uid()
    )
  );

-- Keyword lists policies
create policy "Users can view own keyword lists"
  on public.keyword_lists for select
  using (auth.uid() = user_id);

create policy "Users can create own keyword lists"
  on public.keyword_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own keyword lists"
  on public.keyword_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own keyword lists"
  on public.keyword_lists for delete
  using (auth.uid() = user_id);

-- List keywords policies
create policy "Users can view keywords in own lists"
  on public.list_keywords for select
  using (
    exists (
      select 1 from public.keyword_lists
      where id = list_id
      and user_id = auth.uid()
    )
  );

create policy "Users can add keywords to own lists"
  on public.list_keywords for insert
  with check (
    exists (
      select 1 from public.keyword_lists
      where id = list_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update keywords in own lists"
  on public.list_keywords for update
  using (
    exists (
      select 1 from public.keyword_lists
      where id = list_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete keywords from own lists"
  on public.list_keywords for delete
  using (
    exists (
      select 1 from public.keyword_lists
      where id = list_id
      and user_id = auth.uid()
    )
  );

-- Add indexes for better performance
create index if not exists users_team_role_idx on public.users(team_id, role);
create index if not exists team_invites_team_status_idx on public.team_invites(team_id, status);
create index if not exists credits_history_user_idx on public.credits_history(user_id);
create index if not exists backlink_results_user_idx on public.backlink_results(user_id);
create index if not exists domain_history_user_lookup_idx on public.domain_history(user_id, created_at desc);
create index if not exists keyword_lists_user_idx on public.keyword_lists(user_id);
create index if not exists list_keywords_list_idx on public.list_keywords(list_id);

-- Add function to cleanup expired data
create or replace function cleanup_expired_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete expired shared links
  delete from shared_domain_history where expires_at <= now();
  
  -- Delete old domain history (keep last 30 days)
  delete from domain_history where created_at < now() - interval '30 days';
  
  -- Delete old backlink results (keep last 30 days)
  delete from backlink_results where created_at < now() - interval '30 days';
end;
$$;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- select cron.schedule('cleanup-expired-data', '0 0 * * *', 'select cleanup_expired_data()');