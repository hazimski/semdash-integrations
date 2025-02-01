-- Drop existing functions
drop function if exists public.delete_team_invite(uuid);
drop function if exists public.accept_team_invite(text);

-- Create optimized delete invite function
create or replace function public.delete_team_invite(p_invite_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  with team_check as (
    select team_id 
    from team_invites 
    where id = p_invite_id
    limit 1
  )
  delete from team_invites
  where id = p_invite_id
    and exists (
      select 1 
      from users, team_check
      where users.id = auth.uid()
      and users.team_id = team_check.team_id
      and users.role in ('owner', 'admin')
    );
$$;

-- Create optimized accept invite function
create or replace function public.accept_team_invite(p_token text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with invite_data as (
    select team_id, role
    from team_invites
    where token = p_token
      and status = 'pending'
      and expires_at > now()
      and email = auth.jwt()->>'email'
    for update
    limit 1
  ),
  invite_update as (
    update team_invites
    set status = 'accepted'
    where token = p_token
      and exists (select 1 from invite_data)
  )
  update users
  set 
    team_id = (select team_id from invite_data),
    role = (select role from invite_data),
    updated_at = now()
  where id = auth.uid()
    and team_id is null
    and exists (select 1 from invite_data)
  returning true;
$$;

-- Add index for faster token lookups
create index if not exists team_invites_token_status_idx on team_invites(token, status);
