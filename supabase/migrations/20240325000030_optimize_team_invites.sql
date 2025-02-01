-- Optimize team invites table
alter table public.team_invites
add column status text check (status in ('pending', 'accepted', 'expired')) default 'pending';

-- Add index for faster status checks
create index team_invites_status_idx on public.team_invites(status);

-- Add function to cleanup expired invites
create or replace function public.cleanup_expired_invites()
returns void
language plpgsql
security definer
as $$
begin
  update public.team_invites
  set status = 'expired'
  where expires_at <= now()
  and status = 'pending';
end;
$$;

-- Create a trigger to automatically run cleanup
create or replace function public.check_invite_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.expires_at <= now() then
    new.status := 'expired';
  end if;
  return new;
end;
$$;

create trigger team_invites_expiry_check
  before insert or update on public.team_invites
  for each row
  execute function public.check_invite_expiry();

-- Optimize accept_team_invite function
create or replace function public.accept_team_invite(
  p_token text
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_invite record;
begin
  -- Get and validate invite in a single query
  update public.team_invites
  set status = 'accepted'
  where token = p_token
    and status = 'pending'
    and expires_at > now()
    and email = auth.jwt()->>'email'
  returning * into v_invite;
  
  if not found then
    return false;
  end if;

  -- Update user in a single query
  update public.users
  set 
    team_id = v_invite.team_id,
    role = v_invite.role,
    updated_at = now()
  where id = auth.uid()
    and team_id is null;

  return true;
end;
$$;
