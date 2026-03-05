# Persistent Git Sync & Architecture Instructions

After any changes to the frontend or backend, ensure they are uploaded to their respective Git repositories.

## Architecture (n8n removed)
The project now runs entirely on native code:
- **Frontend (`campaign-scheduler`)**: 
  - Handles Google OAuth initialization and callback (`/api/auth/callback/google`).
  - Git: `https://github.com/shayan-human/E-MAIL-FLOW-FRONTENT1.git`
  - Hosting: Vercel
- **Backend (`campaign-backend`)**:
  - Handles automated email sending and reply detection via native cron jobs.
  - Encryption: Tokens are encrypted in the database; the backend decrypts them before use.
  - Git: `https://github.com/shayan-human/E-MAIL-FLOW-BACKEND.git`
  - Hosting: Render

## Security & Pushing
Always check `.gitignore` before pushing to avoid committing secrets.
Always verify builds and run proper checks (e.g., `npm run build` or `npm run lint` or `tsc --noEmit`) BEFORE committing and pushing changes to GitHub.
