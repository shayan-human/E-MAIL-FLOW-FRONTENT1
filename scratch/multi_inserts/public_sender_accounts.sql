INSERT INTO public.sender_accounts (user_id, email, google_access_token) VALUES
('user-a', 'repro-isolation@gmail.com', 'dummy-token'),
('user-a', 'final-check@gmail.com', 'token-a')
ON CONFLICT DO NOTHING;

