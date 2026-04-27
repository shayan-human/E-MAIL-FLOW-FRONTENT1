INSERT INTO auth.email_otps (id, email, purpose, otp_hash, expires_at, consumed_at, created_at, updated_at) VALUES
('8f6ba3fc-c313-4742-abb9-4dbe1834e13b', 'effortlessearn123@gmail.com', 'RESET_PASSWORD', 'f4c0d973a2bb2089e1a359082fa960144432f350f6131d638a2b8cd5de4a374f', '2026-03-06 11:04:06.873+00', '2026-03-05 11:04:28.679248+00', '2026-03-05 11:03:16.051827+00', '2026-03-05 11:04:28.679248+00')
ON CONFLICT (id) DO NOTHING;

