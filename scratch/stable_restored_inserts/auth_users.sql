-- BATCH START --
INSERT INTO auth.users (id, email, password, email_verified, created_at, updated_at, profile, metadata, is_project_admin, is_anonymous) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@example.com', '$2b$10$0PGIeAD19PVflu6kGfZqSuEJZ93Dx9t019PMcuV3PlsDuEDXovM8e', 't', '2026-03-02 07:03:54.471339+00', '2026-03-02 07:03:54.471339+00', '{"name": "Administrator"}', '{}', 't', 'f'),
('12345678-1234-5678-90ab-cdef12345678', 'anon@example.com', NULL, 'f', '2026-03-02 07:03:54.506598+00', '2026-03-02 07:03:54.506598+00', '{"name": "Anonymous"}', '{}', 'f', 't'),
('9c70d838-994a-452a-b6b7-1476f98d893e', 'demgrowonline@gmail.com', NULL, 't', '2026-03-04 15:00:27.692721+00', '2026-03-04 15:00:27.692721+00', '{"name": "DemGrow", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJSwULBo2NCZ9WdLHwIchghhYhxjCLS8UxjESzX4Fuaqgxa6WM=s96-c"}', '{}', 'f', 'f'),
('4149d6df-497d-4fba-9efe-046c9ecc6c50', 'effortlessearn123@gmail.com', '$2b$10$Gyo8TnwuR8G0Rm00yPW.MObS/i4rca0BXuUq3au4hojm73ww2rHDu', 't', '2026-03-04 13:39:24.011831+00', '2026-03-05 11:04:28.679248+00', '{"name": "EFFORTLESS EARN", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJo69X923FtuZNvHbylZr7Wbwxl2np_fJhGYZbigzKOJoB8VA=s96-c"}', '{}', 'f', 'f'),
('4717c28a-91fd-48b6-a272-ff94d26d3782', 'qurbanilovers777@gmail.com', NULL, 't', '2026-03-05 13:55:07.363243+00', '2026-03-05 13:55:07.363243+00', '{"name": "Car Theme", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKfa9FiEzaRe4fGUyxVH2AofbSJvYs5g6emd_YO7i6shYRjdQ=s96-c"}', '{}', 'f', 'f'),
('8514f2ec-ebb5-4584-a5f3-9669ec1091d4', 'demgrowpaypal@gmail.com', NULL, 't', '2026-03-08 16:46:47.707562+00', '2026-03-08 16:46:47.707562+00', '{"name": "Demgrow Paypal", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocL0PVu_JtZXHwhcMOMzCc_afQQRpz_vU7jhPKfZxt5Jvu4bOg=s96-c"}', '{}', 'f', 'f'),
('00bbb073-1c20-4dfd-b38a-7c0c8a71e196', 'masoodmoazzam16@gmail.com', NULL, 't', '2026-03-09 15:15:59.517942+00', '2026-03-09 15:15:59.517942+00', '{"name": "MOAZZAM SPMS 12", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLcxsVaAXiiKS7o3uLrC7Erdwz_Ae76wXr88Fs-Ry8u6EmY6A=s96-c"}', '{}', 'f', 'f'),
('a7e2b639-3b25-464e-ba8e-f395555d759d', 'shayans1111111@gmail.com', NULL, 't', '2026-03-11 02:42:06.665261+00', '2026-03-11 02:42:06.665261+00', '{"name": "Shayan Alam", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIY-4gDAKf5By_Rz1-mEQbLO-xULq0WLzvF7Uf0obUK-KYGkes=s96-c"}', '{}', 'f', 'f')
ON CONFLICT (id) DO NOTHING;
-- BATCH END --

