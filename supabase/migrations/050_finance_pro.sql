create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text check (type is null or type in ('income', 'expense')),
  color text,
  created_at timestamptz not null default now(),
  constraint finance_categories_unique unique (user_id, name, type)
);

create table if not exists public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD', 'EUR')),
  amount numeric(12, 2) not null check (amount > 0),
  period_month date not null default date_trunc('month', current_date)::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_budgets_unique unique (user_id, category, currency, period_month)
);

create index if not exists idx_finance_categories_user_type_name
  on public.finance_categories (user_id, type, name);

create index if not exists idx_finance_budgets_user_period
  on public.finance_budgets (user_id, period_month);

create index if not exists idx_finance_transactions_user_category_date
  on public.finance_transactions (user_id, category, occurred_at desc)
  where category is not null;

alter table public.finance_categories enable row level security;
alter table public.finance_budgets enable row level security;

drop policy if exists "finance_categories_own" on public.finance_categories;
create policy "finance_categories_own"
  on public.finance_categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "finance_budgets_own" on public.finance_budgets;
create policy "finance_budgets_own"
  on public.finance_budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'finance_budgets_updated_at'
  ) then
    execute 'create trigger finance_budgets_updated_at
      before update on public.finance_budgets
      for each row execute function public.set_updated_at()';
  end if;
end;
$$;

create or replace function public.get_finance_category_summary(
  p_user_id uuid,
  p_from date default null,
  p_to date default null
)
returns table (
  type text,
  category text,
  currency text,
  total numeric,
  transaction_count integer
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  return query
  select
    ft.type,
    coalesce(nullif(ft.category, ''), 'Sin categoria') as category,
    ft.currency,
    sum(ft.amount)::numeric as total,
    count(*)::integer as transaction_count
  from public.finance_transactions ft
  where ft.user_id = p_user_id
    and (p_from is null or ft.occurred_at >= p_from)
    and (p_to is null or ft.occurred_at <= p_to)
  group by ft.type, coalesce(nullif(ft.category, ''), 'Sin categoria'), ft.currency
  order by total desc;
end;
$$;

revoke all on function public.get_finance_category_summary(uuid, date, date) from public;
grant execute on function public.get_finance_category_summary(uuid, date, date) to authenticated;

create or replace function public.get_finance_budget_status(
  p_user_id uuid,
  p_period_month date default current_date
)
returns table (
  id uuid,
  category text,
  currency text,
  budget_amount numeric,
  spent_amount numeric,
  remaining_amount numeric,
  usage_rate numeric
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_month date := date_trunc('month', p_period_month)::date;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  return query
  with spent as (
    select
      coalesce(nullif(ft.category, ''), 'Sin categoria') as category,
      ft.currency,
      sum(ft.amount)::numeric as total
    from public.finance_transactions ft
    where ft.user_id = p_user_id
      and ft.type = 'expense'
      and ft.occurred_at >= v_month
      and ft.occurred_at < (v_month + interval '1 month')
    group by coalesce(nullif(ft.category, ''), 'Sin categoria'), ft.currency
  )
  select
    b.id,
    b.category,
    b.currency,
    b.amount as budget_amount,
    coalesce(s.total, 0)::numeric as spent_amount,
    (b.amount - coalesce(s.total, 0))::numeric as remaining_amount,
    case
      when b.amount = 0 then 0
      else round((coalesce(s.total, 0) / b.amount), 4)
    end as usage_rate
  from public.finance_budgets b
  left join spent s on s.category = b.category and s.currency = b.currency
  where b.user_id = p_user_id
    and b.period_month = v_month
  order by usage_rate desc, b.category;
end;
$$;

revoke all on function public.get_finance_budget_status(uuid, date) from public;
grant execute on function public.get_finance_budget_status(uuid, date) to authenticated;
