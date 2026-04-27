INSERT INTO system.migrations (id, name, run_on) VALUES
('1', '000_create-base-tables', '2026-03-02 07:03:46.825596'),
('2', '001_create-helper-functions', '2026-03-02 07:03:46.825596'),
('3', '002_rename-auth-tables', '2026-03-02 07:03:46.825596'),
('4', '003_create-users-table', '2026-03-02 07:03:46.825596'),
('5', '004_add-reload-postgrest-func', '2026-03-02 07:03:46.825596'),
('6', '005_enable-project-admin-modify-users', '2026-03-02 07:03:46.825596'),
('7', '006_modify-ai-usage-table', '2026-03-02 07:03:46.825596'),
('8', '007_drop-metadata-table', '2026-03-02 07:03:46.825596'),
('9', '008_add-system-tables', '2026-03-02 07:03:46.825596'),
('10', '009_add-function-secrets', '2026-03-02 07:03:46.825596')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system.migrations (id, name, run_on) VALUES
('11', '010_modify-ai-config-modalities', '2026-03-02 07:03:46.825596'),
('12', '011_refactor-secrets-table', '2026-03-02 07:03:46.825596'),
('13', '012_add-storage-uploaded-by', '2026-03-02 07:03:46.825596'),
('14', '013_create-auth-schema-functions', '2026-03-02 07:03:46.825596'),
('15', '014_add-updated-at-trigger-user-table', '2026-03-02 07:03:46.825596'),
('16', '015_create-auth-config-and-email-otp-tables', '2026-03-02 07:03:46.825596'),
('17', '016_update-auth-config-and-email-otp', '2026-03-02 07:03:46.825596'),
('18', '017_create-realtime-schema', '2026-03-02 07:03:46.825596'),
('19', '018_schema-rework', '2026-03-02 07:03:46.825596'),
('20', '019_create-deployments-table', '2026-03-02 07:03:46.825596')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system.migrations (id, name, run_on) VALUES
('21', '020_add-audio-modality', '2026-03-02 07:03:46.825596'),
('22', '021_create-schedules-schema', '2026-03-02 07:03:46.825596'),
('23', '022_create-function-deployments', '2026-03-02 07:03:46.825596'),
('24', '023_ai-configs-soft-delete', '2026-03-02 07:03:47.337562')
ON CONFLICT (id) DO NOTHING;

