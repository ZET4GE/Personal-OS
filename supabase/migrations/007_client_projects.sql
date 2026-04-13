-- ─────────────────────────────────────────────────────────────
-- Freelance — Clients, Client Projects, Payments
-- ─────────────────────────────────────────────────────────────

CREATE TABLE clients (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       VARCHAR(255)  NOT NULL,
  email      VARCHAR(255),
  company    VARCHAR(255),
  phone      VARCHAR(50),
  notes      TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE client_projects (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id    UUID          REFERENCES clients(id) ON DELETE SET NULL,
  title        VARCHAR(255)  NOT NULL,
  description  TEXT,
  status       VARCHAR(50)   NOT NULL DEFAULT 'proposal'
                 CHECK (status IN ('proposal', 'active', 'paused', 'completed', 'cancelled')),
  priority     VARCHAR(20)   NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high')),
  budget       DECIMAL(12,2),
  currency     VARCHAR(3)    NOT NULL DEFAULT 'ARS',
  paid_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_date   DATE,
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE project_payments (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID          NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  user_id      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       DECIMAL(12,2) NOT NULL,
  currency     VARCHAR(3)    NOT NULL DEFAULT 'ARS',
  payment_date DATE          NOT NULL DEFAULT CURRENT_DATE,
  method       VARCHAR(50),  -- transfer, cash, crypto, paypal, other
  notes        TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────

CREATE INDEX idx_clients_user_id          ON clients (user_id);
CREATE INDEX idx_client_projects_user_id  ON client_projects (user_id);
CREATE INDEX idx_client_projects_status   ON client_projects (user_id, status);
CREATE INDEX idx_client_projects_client   ON client_projects (client_id);
CREATE INDEX idx_project_payments_project ON project_payments (project_id);

-- ─────────────────────────────────────────────────────────────
-- Trigger: updated_at en client_projects
-- ─────────────────────────────────────────────────────────────

CREATE TRIGGER client_projects_updated_at
  BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Trigger: sincronizar paid_amount al insertar/actualizar/borrar pago
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_paid_amount()
RETURNS TRIGGER AS $$
DECLARE
  target_project_id UUID;
BEGIN
  -- En DELETE, NEW es null; usar OLD
  target_project_id := COALESCE(NEW.project_id, OLD.project_id);

  UPDATE client_projects
  SET
    paid_amount = COALESCE(
      (SELECT SUM(amount) FROM project_payments WHERE project_id = target_project_id),
      0
    ),
    updated_at = NOW()
  WHERE id = target_project_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON project_payments
  FOR EACH ROW EXECUTE FUNCTION update_paid_amount();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients: all own"
  ON clients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "client_projects: all own"
  ON client_projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_payments: all own"
  ON project_payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
