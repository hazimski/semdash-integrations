-- Drop existing objects
drop trigger if exists check_invite_status on public.team_invites;
drop function if exists public.handle_invite_status();
drop function if exists public.accept_team_invite(text);
drop function if exists public.delete_team_invite(uuid);
drop type if exists team_invite_status;

-- Create invite status type
create type team_invite_status as enum ('pending', 'accepted', 'expired');

-- Update team_invites table
alter table public.team_invites 
add column if not exists status team_invite_status not null default 'pending';

-- Create optimized accept_team_invite function
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
    limit 1
  ),
  invite_update as (
    update team_invites
    set status = 'accepted'
    where token = p_token
      and status = 'pending'
      and exists (select 1 from invite_data)
    returning team_id, role
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

-- Create status update function
create or replace function public.update_invite_status()
returns trigger
language sql
security definer
set search_path = public
as $$
  update team_invites
  set status = 'expired'
  where id = new.id
    and expires_at <= now()
    and status = 'pending'
  returning true;
$$;

-- Create trigger for status updates
create trigger update_invite_status_trigger
  after insert or update on public.team_invites
  for each row
  execute function public.update_invite_status();

-- Create delete invite function
create or replace function public.delete_team_invite(p_invite_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from team_invites
  where id = p_invite_id
    and exists (
      select 1 from users
      where id = auth.uid()
      and team_id = team_invites.team_id
      and role in ('owner', 'admin')
    );
$$;

-- Add index for faster status checks
create index if not exists team_invites_status_idx on public.team_invites(status);
