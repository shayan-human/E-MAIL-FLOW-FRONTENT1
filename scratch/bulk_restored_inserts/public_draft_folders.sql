INSERT INTO public.draft_folders (id, user_id, name, color, created_at) VALUES
('3482820e-0aad-4655-ac92-92b286955415', '9c70d838-994a-452a-b6b7-1476f98d893e', 'san  francico', '#3B82F6', '2026-03-15 10:02:13.155036+00'),
('f03dc9a4-361d-4aef-9125-0be957bea3d8', '4149d6df-497d-4fba-9efe-046c9ecc6c50', 'yo', '#F59E0B', '2026-03-15 15:25:54.672276+00')
ON CONFLICT (id) DO NOTHING;

