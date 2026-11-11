# SellBro

Personal web app to manage reselling ~50 used items (clothing, tech, board games) on Vinted and Subito.

## Stack

- **Frontend**: Vite + React 19 + TypeScript (strict) + Tailwind CSS v4
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Deploy**: Static build via FTP to Hostinger (Apache)
- **PWA**: Installable on mobile

## Local setup

### Prerequisites

- Node.js 22+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <repo-url>
cd SellBro
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your Supabase project URL and anon key, plus a Google Gemini API key (used by the AI photo analysis):

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GEMINI_API_KEY=...
```

### 3. Database setup

Apply the migration to your Supabase project:

```bash
supabase db push
```

Or run the SQL in `supabase/migrations/00001_initial_schema.sql` manually in the Supabase SQL Editor.

### 4. Supabase Auth

Create a single user in the Supabase dashboard under Authentication > Users. Disable sign-ups in Authentication > Settings.

### 5. Run

```bash
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run format` | Prettier format |

## Deploy

The GitHub Action (`.github/workflows/deploy.yml`) runs on push to `main`:

1. `npm ci` → `typecheck` → `lint` → `test` → `build`
2. Deploy `dist/` via FTP

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `FTP_SERVER` | Hostinger FTP hostname |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `FTP_SERVER_DIR` | Remote directory (e.g. `/public_html/sell/`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key (ends up in the public bundle: restrict it to the site domain) |

## Project structure

```
src/
├── components/
│   ├── ui/        # Button, Input, Select, Textarea, Badge, Modal, Toast
│   ├── layout/    # AppShell, AuthGuard
│   ├── items/     # ItemCard, ItemForm, ItemFilters
│   └── photos/    # PhotoGrid, PhotoUploader, PhotoSection
├── pages/         # LoginPage, ItemListPage, ItemDetailPage, ItemFormPage
├── hooks/         # useAuth, useItems, usePhotos
├── lib/           # supabase, types, validation, compression, clipboard, constants
└── index.css      # Tailwind theme (dark pastel)

supabase/migrations/  # SQL migrations
tests/                # Vitest tests
```
