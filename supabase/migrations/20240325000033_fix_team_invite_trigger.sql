-- Drop existing objects
drop trigger if exists update_invite_status_trigger on public.team_invites;
drop function if exists public.update_invite_status();

-- Create status update trigger function
create or replace function public.update_invite_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.expires_at <= now() and new.status = 'pending' then
    new.status := 'expired';
  end if;
  return new;
end;
$$;

-- Create trigger for status updates
create trigger update_invite_status_trigger
  before insert or update on public.team_invites
  for each row
  execute function public.update_invite_status();

-- Add periodic cleanup function
create or replace function public.cleanup_expired_invites()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update team_invites
  set status = 'expired'
  where expires_at <= now()
  and status = 'pending';
end;
$$;
