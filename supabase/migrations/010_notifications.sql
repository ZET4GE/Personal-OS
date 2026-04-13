-- ─────────────────────────────────────────────────────────────
-- 010_notifications.sql — Sistema de notificaciones internas
-- ─────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type         VARCHAR(50)  NOT NULL,                    -- 'deadline' | 'payment' | 'habit_streak' | 'system'
  title        VARCHAR(255) NOT NULL,
  message      TEXT,
  link         TEXT,                                      -- ruta interna, p.ej. '/freelance/uuid'
  related_id   UUID,
  related_type VARCHAR(50),                               -- 'client_project' | 'habit' | etc.
  priority     VARCHAR(20)  DEFAULT 'normal',             -- 'low' | 'normal' | 'high' | 'urgent'
  is_read      BOOLEAN      DEFAULT false,
  read_at      TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Función: deadlines próximos (dentro de 3 días)
-- Deduplicada: no inserta si ya existe una notificación del mismo
-- proyecto con type='deadline' en las últimas 24 h.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_upcoming_deadlines()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      cp.id,
      cp.user_id,
      cp.title,
      cp.due_date,
      c.name AS client_name
    FROM  client_projects cp
    LEFT  JOIN clients c ON cp.client_id = c.id
    WHERE cp.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
      AND cp.status NOT IN ('completed', 'cancelled')
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE  n.related_id = cp.id
          AND  n.type       = 'deadline'
          AND  n.created_at > NOW() - INTERVAL '1 day'
      )
  LOOP
    INSERT INTO notifications
      (user_id, type, title, message, link, related_id, related_type, priority)
    VALUES (
      rec.user_id,
      'deadline',
      'Proyecto por vencer',
      'El proyecto "' || rec.title || '"'
        || CASE WHEN rec.client_name IS NOT NULL
             THEN ' para ' || rec.client_name
             ELSE ''
           END
        || ' vence el ' || TO_CHAR(rec.due_date, 'DD/MM/YYYY'),
      '/freelance/' || rec.id,
      rec.id,
      'client_project',
      CASE
        WHEN rec.due_date  = CURRENT_DATE               THEN 'urgent'
        WHEN rec.due_date <= CURRENT_DATE + INTERVAL '1 day' THEN 'high'
        ELSE 'normal'
      END
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Función: pagos pendientes en proyectos completados
-- Deduplicada: no inserta si ya existe una del mismo proyecto
-- con type='payment' en los últimos 7 días.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_pending_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      cp.id,
      cp.user_id,
      cp.title,
      cp.budget,
      cp.paid_amount,
      cp.currency,
      c.name AS client_name
    FROM  client_projects cp
    LEFT  JOIN clients c ON cp.client_id = c.id
    WHERE cp.status = 'completed'
      AND (cp.budget - cp.paid_amount) > 0
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE  n.related_id = cp.id
          AND  n.type       = 'payment'
          AND  n.created_at > NOW() - INTERVAL '7 days'
      )
  LOOP
    INSERT INTO notifications
      (user_id, type, title, message, link, related_id, related_type, priority)
    VALUES (
      rec.user_id,
      'payment',
      'Pago pendiente',
      'Tenés un pago pendiente de '
        || CASE rec.currency
             WHEN 'USD' THEN 'US$'
             WHEN 'EUR' THEN '€'
             ELSE '$'
           END
        || TO_CHAR(rec.budget - rec.paid_amount, 'FM999,999,999')
        || ' por "' || rec.title || '"',
      '/freelance/' || rec.id,
      rec.id,
      'client_project',
      'normal'
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Función: milestones de racha de hábitos
-- Milestones: 7, 14, 21, 30, 60, 90, 100, 365 días
-- Deduplicada por related_id + tipo de mensaje.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_habit_streak()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  hab          RECORD;
  streak_count INTEGER;
BEGIN
  FOR hab IN
    SELECT id, user_id, name FROM habits WHERE is_active = true
  LOOP
    SELECT COUNT(*) INTO streak_count
    FROM   habit_logs
    WHERE  habit_id     = hab.id
      AND  completed_at >= CURRENT_DATE - INTERVAL '365 days';

    IF streak_count = ANY(ARRAY[7, 14, 21, 30, 60, 90, 100, 365]) THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE  n.related_id = hab.id
          AND  n.type       = 'habit_streak'
          AND  n.message    LIKE '%' || streak_count::TEXT || ' días%'
      ) THEN
        INSERT INTO notifications
          (user_id, type, title, message, link, related_id, related_type, priority)
        VALUES (
          hab.user_id,
          'habit_streak',
          '🔥 ¡Racha de ' || streak_count || ' días!',
          '¡Felicitaciones! Llevas ' || streak_count
            || ' días con el hábito "' || hab.name || '"',
          '/habits',
          hab.id,
          'habit',
          'low'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;
