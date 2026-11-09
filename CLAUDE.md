# SellBro

Personal web app to manage reselling ~50 used items on Vinted and Subito.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Typecheck + build
npm run typecheck    # TypeScript check only
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
npm run format       # Prettier
```

## Conventions

- Language: code in English, UI strings in Italian
- TypeScript strict mode, no `any`
- Tailwind CSS v4 with custom theme in `src/index.css`
- Dark mode only (pastel palette)
- Mobile-first responsive design

## Security rules

- RLS on all Supabase tables: `user_id = auth.uid()`
- Private storage bucket, photos served via signed URLs
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in frontend
- The `service_role` key must NEVER appear in code or repo
- `.env` is gitignored; `.env.example` has empty placeholders
