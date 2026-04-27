-- BATCH START --
INSERT INTO auth.oauth_configs (id, provider, client_id, secret_id, scopes, redirect_uri, use_shared_key, created_at, updated_at) VALUES
('c046eb89-20a3-4ef4-99e0-befa0d78b860', 'google', NULL, NULL, '{openid,email,profile}', NULL, 't', '2026-03-02 07:03:54.780697+00', '2026-03-02 07:03:54.780697+00'),
('82c79c6a-bde3-40a7-85a1-5188080cb8de', 'github', NULL, NULL, '{user:email}', NULL, 't', '2026-03-02 07:03:54.830612+00', '2026-03-02 07:03:54.830612+00')
ON CONFLICT (id) DO NOTHING;
-- BATCH END --

