begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text check (char_length(display_name) <= 100),
  locale text not null default 'es-AR',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  onboarding_completed boolean not null default false,
  local_data_migrated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null check (period_start >= date '2000-01-01' and period_start <= current_date),
  average_cycle_length integer not null check (average_cycle_length between 21 and 45),
  minimum_cycle_length integer not null check (minimum_cycle_length between 15 and 60),
  maximum_cycle_length integer not null check (maximum_cycle_length between 15 and 60),
  regularity text not null check (regularity in ('regular', 'algo_variable', 'irregular', 'no_se')),
  ovulation_method text not null check (ovulation_method in ('calendar', 'known', 'lh', 'unsure')),
  known_ovulation_date date,
  lh_surge_date date,
  lh_result text check (lh_result is null or lh_result in ('low', 'high', 'peak')),
  body_signals jsonb not null default '{}'::jsonb check (jsonb_typeof(body_signals) = 'object'),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cycle_length_order check (minimum_cycle_length <= average_cycle_length and average_cycle_length <= maximum_cycle_length)
);

create unique index cycles_one_active_per_user on public.cycles(user_id) where is_active;
create index cycles_user_period_idx on public.cycles(user_id, period_start desc);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete cascade,
  log_date date not null check (log_date >= date '2000-01-01'),
  note text check (char_length(note) <= 2000),
  symptoms text check (char_length(symptoms) <= 1000),
  bbt numeric(4,2) check (bbt is null or bbt between 30 and 45),
  lh_result text check (lh_result is null or lh_result in ('low', 'high', 'peak')),
  mucus text check (mucus is null or mucus in ('dry', 'sticky', 'creamy', 'watery', 'egg_white')),
  cervix_position text check (cervix_position is null or cervix_position in ('low', 'medium', 'high')),
  sex_methods text[] not null default '{}',
  exposure_note text check (char_length(exposure_note) <= 1000),
  stress_level text check (stress_level is null or stress_level in ('low', 'medium', 'high')),
  sleep_quality text check (sleep_quality is null or sleep_quality in ('low', 'medium', 'high')),
  travel_or_illness boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, log_date)
);
create index daily_logs_user_date_idx on public.daily_logs(user_id, log_date desc);
create index daily_logs_cycle_idx on public.daily_logs(cycle_id);

create table public.exposures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete cascade,
  exposure_date date not null check (exposure_date >= date '2000-01-01'),
  methods text[] not null default '{}',
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index exposures_user_date_idx on public.exposures(user_id, exposure_date desc);
create index exposures_cycle_idx on public.exposures(cycle_id);

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_product_id text,
  status text not null default 'none' check (status in ('none', 'trialing', 'active', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'paused', 'canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index subscriptions_customer_idx on public.subscriptions(stripe_customer_id);

create table public.stripe_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null,
  processed_at timestamptz not null default timezone('utc', now()),
  payload_version text,
  processing_error text check (char_length(processing_error) <= 500)
);

create or replace function public.claim_stripe_event(
  p_event_id text,
  p_event_type text,
  p_livemode boolean,
  p_payload_version text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer := 0;
begin
  insert into public.stripe_events (stripe_event_id, event_type, livemode, payload_version, processing_error)
  values (p_event_id, p_event_type, p_livemode, p_payload_version, 'processing')
  on conflict (stripe_event_id) do nothing;
  if found then return true; end if;

  update public.stripe_events
  set processing_error = 'processing', processed_at = timezone('utc', now())
  where stripe_event_id = p_event_id
    and processing_error is not null
    and processing_error <> 'processing';
  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger cycles_updated_at before update on public.cycles for each row execute function public.set_updated_at();
create trigger daily_logs_updated_at before update on public.daily_logs for each row execute function public.set_updated_at();
create trigger exposures_updated_at before update on public.exposures for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id, status)
  values (new.id, 'none')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cycles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.exposures enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;

create policy profiles_select_own on public.profiles for select using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy cycles_select_own on public.cycles for select using ((select auth.uid()) = user_id);
create policy cycles_insert_own on public.cycles for insert with check ((select auth.uid()) = user_id);
create policy cycles_update_own on public.cycles for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy cycles_delete_own on public.cycles for delete using ((select auth.uid()) = user_id);

create policy daily_logs_select_own on public.daily_logs for select using ((select auth.uid()) = user_id);
create policy daily_logs_insert_own on public.daily_logs for insert with check ((select auth.uid()) = user_id);
create policy daily_logs_update_own on public.daily_logs for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy daily_logs_delete_own on public.daily_logs for delete using ((select auth.uid()) = user_id);

create policy exposures_select_own on public.exposures for select using ((select auth.uid()) = user_id);
create policy exposures_insert_own on public.exposures for insert with check ((select auth.uid()) = user_id);
create policy exposures_update_own on public.exposures for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy exposures_delete_own on public.exposures for delete using ((select auth.uid()) = user_id);

create policy subscriptions_select_own on public.subscriptions for select using ((select auth.uid()) = user_id);

revoke all on public.stripe_events from anon, authenticated;
revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke all on function public.claim_stripe_event(text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_stripe_event(text, text, boolean, text) to service_role;

commit;
