-- Add additional indexes for better performance
create index if not exists domain_overviews_updated_at_idx on public.domain_overviews(updated_at desc);

-- Add function to cleanup old domain overviews
create or replace function public.cleanup_old_domain_overviews()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  -- Keep only the latest overview per domain
  with latest_overviews as (
    select distinct on (lower(domain)) id
    from domain_overviews
    order by lower(domain), updated_at desc
  )
  delete from domain_overviews
  where id not in (select id from latest_overviews);

  -- Delete overviews older than 30 days that haven't been updated
  delete from domain_overviews
  where updated_at < now() - interval '30 days';
end;
$$;

-- Add trigger to update updated_at timestamp
create or replace function public.update_domain_overview_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_domain_overview_timestamp
  before update on public.domain_overviews
  for each row
  execute function public.update_domain_overview_timestamp();