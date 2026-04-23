alter table public.profiles
  add column if not exists portfolio_font_style text not null default 'sans',
  add column if not exists portfolio_background_style text not null default 'mist',
  add column if not exists portfolio_card_style text not null default 'glass',
  add column if not exists portfolio_accent_style text not null default 'blue';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_portfolio_font_style_check'
  ) then
    alter table public.profiles
      add constraint profiles_portfolio_font_style_check
      check (portfolio_font_style in ('sans', 'serif', 'mono'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_portfolio_background_style_check'
  ) then
    alter table public.profiles
      add constraint profiles_portfolio_background_style_check
      check (portfolio_background_style in ('mist', 'grid', 'stage'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_portfolio_card_style_check'
  ) then
    alter table public.profiles
      add constraint profiles_portfolio_card_style_check
      check (portfolio_card_style in ('glass', 'solid', 'outline'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_portfolio_accent_style_check'
  ) then
    alter table public.profiles
      add constraint profiles_portfolio_accent_style_check
      check (portfolio_accent_style in ('blue', 'emerald', 'sunset', 'mono'));
  end if;
end
$$;
