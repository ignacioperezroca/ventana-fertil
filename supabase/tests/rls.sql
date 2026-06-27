-- Run in a disposable Supabase database after applying migrations.
-- The assertions demonstrate ownership isolation; replace UUIDs only if your harness requires it.
begin;
select plan(4);

select tests.create_supabase_user('owner@example.com', 'owner');
select tests.create_supabase_user('other@example.com', 'other');

select tests.authenticate_as('owner');
insert into public.cycles (user_id, period_start, average_cycle_length, minimum_cycle_length, maximum_cycle_length, regularity, ovulation_method)
values (tests.get_supabase_uid('owner'), current_date, 28, 26, 30, 'regular', 'calendar');
select is((select count(*) from public.cycles), 1::bigint, 'owner can read own cycle');

select tests.authenticate_as('other');
select is((select count(*) from public.cycles), 0::bigint, 'other user cannot read owner cycle');
select throws_ok(
  format('insert into public.cycles (user_id, period_start, average_cycle_length, minimum_cycle_length, maximum_cycle_length, regularity, ovulation_method) values (%L, current_date, 28, 26, 30, ''regular'', ''calendar'')', tests.get_supabase_uid('owner')),
  '42501', null, 'other user cannot insert for owner'
);
select is((select count(*) from public.subscriptions), 1::bigint, 'user only reads own subscription row');

select * from finish();
rollback;
