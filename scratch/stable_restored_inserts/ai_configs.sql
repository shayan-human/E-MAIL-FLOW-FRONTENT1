-- BATCH START --
INSERT INTO ai.configs (id, provider, model_id, system_prompt, created_at, updated_at, input_modality, output_modality, is_active) VALUES
('c782d165-c811-40a6-9b7f-d957e3fa0808', 'openrouter', 'google/gemini-3-pro-image-preview', NULL, '2026-03-02 07:03:55.639831+00', '2026-03-02 07:03:55.639831+00', '{text,image}', '{text,image}', 't'),
('df057cbc-bd3c-4cb0-9574-117555dffa67', 'openrouter', 'openai/gpt-4o-mini', NULL, '2026-03-02 07:03:55.882568+00', '2026-03-02 07:03:55.882568+00', '{text,image}', '{text}', 't'),
('0a3d4aeb-5f37-4459-abc4-8ef35af40e48', 'openrouter', 'anthropic/claude-sonnet-4.5', NULL, '2026-03-02 07:03:55.893912+00', '2026-03-02 07:03:55.893912+00', '{text,image}', '{text}', 't'),
('9c7fc8a2-13e0-4062-b29d-175bbfe06f8d', 'openrouter', 'x-ai/grok-4.1-fast', NULL, '2026-03-02 07:03:55.899286+00', '2026-03-02 07:03:55.899286+00', '{text,image}', '{text}', 't'),
('3085ef0b-a738-481c-8965-c2b2761e50bf', 'openrouter', 'minimax/minimax-m2.1', NULL, '2026-03-02 07:03:55.906084+00', '2026-03-02 07:03:55.906084+00', '{text,image}', '{text}', 't'),
('482f893c-dbec-49fd-ae99-6f912112fe56', 'openrouter', 'deepseek/deepseek-v3.2', NULL, '2026-03-02 07:03:55.91086+00', '2026-03-02 07:03:55.91086+00', '{text,image}', '{text}', 't'),
('5017c8ef-12e2-4380-9356-3df9341a1b65', 'openrouter', 'openai/gpt-4o', NULL, '2026-03-07 20:10:56.512173+00', '2026-03-07 20:11:09.851122+00', '{text,image}', '{text}', 'f')
ON CONFLICT (id) DO NOTHING;
-- BATCH END --

