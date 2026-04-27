INSERT INTO auth.configs (id, require_email_verification, password_min_length, require_number, require_lowercase, require_uppercase, require_special_char, created_at, updated_at, verify_email_method, reset_password_method, sign_in_redirect_to) VALUES
('6461c970-1eab-4a26-87d2-89759b41d7e4', 't', '6', 'f', 'f', 'f', 'f', '2026-03-02 07:03:55.966468+00', '2026-03-16 16:20:22.293692+00', 'code', 'code', 'https://emailflow.demgrow.space/auth/callback')
ON CONFLICT (id) DO NOTHING;

