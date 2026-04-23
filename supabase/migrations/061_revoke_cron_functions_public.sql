-- 061_revoke_cron_functions_public.sql
-- Security: restrict cron helper functions so only service_role can invoke
-- them via RPC. Without this, any authenticated (or anon) caller could
-- trigger them directly, inserting notifications for all users.

revoke all on function public.check_upcoming_deadlines()  from public;
revoke all on function public.check_upcoming_deadlines()  from anon;
revoke all on function public.check_upcoming_deadlines()  from authenticated;
grant  execute on function public.check_upcoming_deadlines()  to service_role;

revoke all on function public.check_pending_payments()    from public;
revoke all on function public.check_pending_payments()    from anon;
revoke all on function public.check_pending_payments()    from authenticated;
grant  execute on function public.check_pending_payments()    to service_role;

revoke all on function public.notify_habit_streak()       from public;
revoke all on function public.notify_habit_streak()       from anon;
revoke all on function public.notify_habit_streak()       from authenticated;
grant  execute on function public.notify_habit_streak()       to service_role;
