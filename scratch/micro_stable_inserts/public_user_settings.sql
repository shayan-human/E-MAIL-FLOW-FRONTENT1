INSERT INTO public.user_settings (id, user_id, timezone, send_window_from, send_window_to, theme, reply_notifications, bounce_notifications, display_name, created_at, updated_at, send_window_enabled, network_opt_in) VALUES
('027eb02b-edcf-4563-b14e-9cf65f9e5961', '9c70d838-994a-452a-b6b7-1476f98d893e', 'Asia/Kolkata', '09:00:00', '17:00:00', 'dark', 't', 't', 'SHAYAN', '2026-03-14 19:53:14.318722+00', '2026-03-15 19:24:16.417+00', 'f', 'f')
ON CONFLICT (user_id) DO NOTHING;

