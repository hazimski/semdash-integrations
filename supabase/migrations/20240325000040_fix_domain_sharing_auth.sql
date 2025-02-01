-- Drop existing functions
drop function if exists public.create_domain_share_link;
drop function if exists public.get_shared_domain_history;

-- Create improved domain share link function with better auth checks
create or replace function public.create_domain_share_link(
  p_domain_history_id uuid,
  p_expires_in interval default interval '7 days'
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_share_token uuid;
  v_user_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Verify ownership with detailed error
  if not exists (
    select 1 from domain_history
    where id = p_domain_history_id
    and user_id = v_user_id
  ) then
    raise exception 'Not authorized to share this domain history';
  end if;

  -- Generate unique token
  v_share_token := gen_random_uuid();

  -- Create shared link with error handling
  begin
    insert into shared_domain_history (
      share_token,
      domain_history_id,
      expires_at
    ) values (
      v_share_token,
      p_domain_history_id,
      now() + p_expires_in
    );
  exception when others then
    raise exception 'Failed to create share link: %', sqlerrm;
  end;

  return v_share_token;
end;
$$;

-- Create improved shared domain history getter with better error handling
create or replace function public.get_shared_domain_history(
  p_share_token uuid
)
returns table (
  id uuid,
  domain text,
  location_code text,
  language_code text,
  metrics jsonb,
  data jsonb,
  created_at timestamptz
)
language plpgsql security definer set search_path = public
as $$
begin
  return query
  select 
    dh.id,
    dh.domain,
    dh.location_code,
    dh.language_code,
    dh.metrics,
    dh.data,
    dh.created_at
  from shared_domain_history sh
  join domain_history dh on dh.id = sh.domain_history_id
  where sh.share_token = p_share_token
  and sh.expires_at > now();

  if not found then
    raise exception 'Share link not found or expired';
  end if;
end;
$$;

-- Add index for faster token lookups
create index if not exists shared_domain_history_token_lookup_idx 
on shared_domain_history(share_token) 
where expires_at > now();

-- Add RLS policy for shared links
create policy "Anyone can view unexpired shared links"
  on public.shared_domain_history for select
  using (expires_at > now());