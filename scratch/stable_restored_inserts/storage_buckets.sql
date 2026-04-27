-- BATCH START --
INSERT INTO storage.buckets (name, public, created_at, updated_at) VALUES
('crm-attachments', 't', '2026-03-11 03:36:35.409703+00', '2026-03-11 03:36:35.409703+00')
ON CONFLICT (id) DO NOTHING;
-- BATCH END --

