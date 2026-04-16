-- Cleanup seguro de RPCs no usadas por la app actual.
-- No elimina tablas ni datos.

drop function if exists public.get_goal_entities(uuid);
drop function if exists public.get_roadmap_progress(uuid);
