alter table public.profiles
  drop constraint if exists profiles_portfolio_font_style_check,
  drop constraint if exists profiles_portfolio_background_style_check,
  drop constraint if exists profiles_portfolio_card_style_check,
  drop constraint if exists profiles_portfolio_accent_style_check;

update public.profiles
set portfolio_font_style = 'editorial'
where portfolio_font_style = 'serif';

alter table public.profiles
  add constraint profiles_portfolio_font_style_check
    check (portfolio_font_style in ('sans', 'grotesk', 'humanist', 'editorial', 'display', 'mono')),
  add constraint profiles_portfolio_background_style_check
    check (portfolio_background_style in ('mist', 'grid', 'stage', 'aurora', 'paper', 'spotlight')),
  add constraint profiles_portfolio_card_style_check
    check (portfolio_card_style in ('glass', 'solid', 'outline', 'soft', 'elevated', 'tint')),
  add constraint profiles_portfolio_accent_style_check
    check (portfolio_accent_style in ('blue', 'emerald', 'sunset', 'violet', 'rose', 'amber', 'cyan', 'mono'));
