-- Create shared_domain_history table
create table if not exists public.shared_domain_history (
  id uuid default gen_random_uuid() primary key,
  share_token text unique not null,
  domain_history_id uuid references public.domain_history(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Add indexes
create index shared_domain_history_token_idx on public.shared_domain_history(share_token);
create index shared_domain_history_expires_idx on public.shared_domain_history(expires_at);

-- Enable RLS
alter table public.shared_domain_history enable row level security;

-- Add RLS policies
create policy "Anyone can view shared domain history"
  on public.shared_domain_history for select
  using (true);

create policy "Users can create shared links for own domain history"
  on public.shared_domain_history for insert
  with check (
    exists (
      select 1 from public.domain_history
      where id = domain_history_id
      and user_id = auth.uid()
    )
  );

-- Add function to create shared link
create or replace function public.create_domain_share_link(
  p_domain_history_id uuid,
  p_expires_in interval default interval '7 days'
)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_share_token text;
begin
  -- Verify ownership
  if not exists (
    select 1 from domain_history
    where id = p_domain_history_id
    and user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  -- Generate unique token
  v_share_token := encode(gen_random_bytes(24), 'hex');

  -- Create shared link
  insert into shared_domain_history (
    share_token,
    domain_history_id,
    expires_at
  ) values (
    v_share_token,
    p_domain_history_id,
    now() + p_expires_in
  );

  return v_share_token;
end;
$$;

-- Add function to get shared domain history
create or replace function public.get_shared_domain_history(p_share_token text)
returns table (
  domain text,
  location_code text,
  language_code text,
  metrics jsonb,
  data jsonb,
  created_at timestamptz
)
language sql security definer set search_path = public
as $$
  select 
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
$$;
