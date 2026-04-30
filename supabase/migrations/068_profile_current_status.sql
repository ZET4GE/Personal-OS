-- current_status: chip de estado visible en el header del perfil público
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_status TEXT;
