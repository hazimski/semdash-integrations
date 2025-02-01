-- Enable RLS on user_settings table
alter table public.user_settings enable row level security;

-- Add RLS policies
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- Add function to get or create user settings
create or replace function public.get_or_create_user_settings()
returns public.user_settings
language plpgsql security definer
as $$
declare
  v_user_id uuid;
  v_settings public.user_settings;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Try to get existing settings
  select * into v_settings
  from public.user_settings
  where user_id = v_user_id;

  -- If no settings exist, create them
  if v_settings is null then
    insert into public.user_settings (user_id)
    values (v_user_id)
    returning * into v_settings;
  end if;

  return v_settings;
end;
$$;