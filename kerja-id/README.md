# KERJA.ID

Super app pencari kerja Indonesia untuk membantu job seeker mengelola proses pencarian kerja dari profil, lowongan, CV, lamaran, analytics, interview practice, sampai komunitas.

> Cari kerja gak harus susah.

## Status Saat Ini

Repo ini berisi aplikasi web Next.js dan API NestJS. Modul backend yang sudah ada di source saat ini mencakup auth, profile, jobs, companies, CV, dan applications/job tracker. Frontend sudah memiliki halaman produk yang lebih luas untuk dashboard, analytics, tracker, CV, job search, interview, skills, salary, connect, micro-intern, remote work, wellness, notifications, alerts, settings, dan onboarding.

## Struktur Repo

```text
kerja-id/
├── backend/        # NestJS API, Prisma, PostgreSQL, Redis
├── frontend/       # Next.js App Router, React, Tailwind CSS
├── docs/           # Dokumentasi API dan deployment
├── infra/          # Docker Compose untuk PostgreSQL dan Redis
└── .github/        # Workflow CI/CD
```

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI, lucide-react, Recharts |
| Backend | NestJS 10, TypeScript, Prisma ORM, PostgreSQL 16, Redis 7 |
| Auth | JWT access token, refresh token, Passport JWT, Google OAuth hooks |
| UI/Data | Axios, Zustand, React Hook Form, Zod |
| Infra | Docker Compose, GitHub Actions |

## Fitur Utama

- Auth: register, login, verify email, forgot/reset password, refresh token, current user.
- Profile: data profil, pengalaman, pendidikan, skill, dan profil publik.
- Jobs: pencarian lowongan, detail lowongan, saved jobs, trending skills.
- Companies: pencarian company, daftar industri, detail company.
- CV: template, versi CV, builder, ATS analysis, dan CV-job matching.
- Tracker: daftar lamaran, kanban/pipeline, timeline, status update, notes, reminders, dan stats.
- Dashboard & analytics: ringkasan aktivitas, status lamaran, response rate, funnel, dan performa source.
- Halaman frontend tambahan: interview practice, skills gap, salary insight, ConnectPro, MicroIntern, remote work, wellness, alerts, notifications, settings.

## Prasyarat

- Node.js 20+
- npm
- Docker dan Docker Compose
- PostgreSQL 16 dan Redis 7, atau jalankan lewat `infra/docker-compose.yml`

## Setup Lokal

1. Clone repo:

```bash
git clone https://github.com/faridadamn/kerja-id.git
cd kerja-id
```

2. Jalankan database dan Redis:

```bash
cd infra
docker compose up -d
```

3. Setup backend:

```bash
cd ../backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend berjalan di `http://localhost:3001`.

4. Setup frontend:

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

## Environment

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Backend minimal untuk development lokal:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://kerja:kerja123@localhost:5432/kerja_id?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
```

Lihat `backend/.env.example` untuk opsi tambahan seperti SendGrid, Google OAuth, dan AWS S3.

## Script Penting

Backend:

```bash
npm run start:dev
npm run build
npm test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

## Dokumentasi API

- Base URL lokal: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`
- Detail endpoint: `docs/API.md`
- Deployment notes: `docs/DEPLOYMENT.md`

Endpoint utama:

| Area | Endpoint |
| --- | --- |
| Auth | `/auth/*` |
| Profile | `/profile/*` |
| Jobs | `/jobs/*` |
| Companies | `/companies/*` |
| CV | `/cv/*` |
| Applications | `/applications/*` |
| Health | `/health` |

## Validasi

Pengecekan TypeScript yang terakhir dipakai:

```bash
cd frontend
npx tsc --noEmit --incremental false -p tsconfig.json

cd ../backend
npx tsc --noEmit --incremental false -p tsconfig.build.json
```

## Catatan Development

- Backend API menggunakan prefix `/api/v1`.
- Frontend menangani beberapa bentuk response list API, baik array langsung maupun object wrapper seperti `{ data: [...] }` dan `{ applications: [...] }`.
- `infra/docker-compose.yml` saat ini hanya menjalankan PostgreSQL dan Redis.
- Beberapa halaman frontend sudah tersedia lebih dulu dari endpoint backend lengkapnya, jadi integrasi modul lanjutan perlu dicek per fitur.

## License

Proprietary — KERJA.ID © 2026
