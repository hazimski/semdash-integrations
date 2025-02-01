-- Optimize team invites table and functions
alter table public.team_invites drop trigger if exists team_invites_expiry_check on public.team_invites;
drop function if exists public.check_invite_expiry;
drop function if exists public.cleanup_expired_invites;
drop function if exists public.accept_team_invite;

-- Add status enum type
create type team_invite_status as enum ('pending', 'accepted', 'expired');

-- Update team_invites table
alter table public.team_invites 
  alter column status type team_invite_status using status::team_invite_status,
  alter column status set default 'pending';

-- Create optimized accept_team_invite function
create or replace function public.accept_team_invite(p_token text)
returns boolean
language sql
security definer
as $$
  with invite_acceptance as (
    update public.team_invites
    set status = 'accepted'::team_invite_status
    where token = p_token
      and status = 'pending'
      and expires_at > now()
      and email = auth.jwt()->>'email'
    returning team_id, role
  )
  update public.users
  set 
    team_id = (select team_id from invite_acceptance),
    role = (select role from invite_acceptance),
    updated_at = now()
  where id = auth.uid()
    and team_id is null
    and exists (select 1 from invite_acceptance)
  returning true;
$$;

-- Create function to handle invite cleanup
create or replace function public.handle_invite_status()
returns trigger
language sql
security definer
as $$
  update public.team_invites
  set status = 'expired'::team_invite_status
  where id = new.id
    and expires_at <= now()
    and status = 'pending'
  returning true;
$$;

-- Add trigger for invite status
create trigger check_invite_status
  after insert or update on public.team_invites
  for each row
  execute function public.handle_invite_status();

-- Create optimized delete_invite function
create or replace function public.delete_team_invite(p_invite_id uuid)
returns void
language sql
security definer
as $$
  delete from public.team_invites
  where id = p_invite_id
    and exists (
      select 1 from public.users
      where id = auth.uid()
      and team_id = team_invites.team_id
      and role in ('owner', 'admin')
    );
$$;
