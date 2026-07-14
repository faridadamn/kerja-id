# KERJA.ID — Super App Pencari Kerja Indonesia

> *"Cari kerja gak harus susah."*

## Architecture

```
kerja-id/
├── backend/        # NestJS API (Node.js + Prisma + PostgreSQL)
├── frontend/       # Next.js Web App (React + Tailwind + shadcn/ui)
├── shared/         # Shared types & utilities
├── infra/          # Docker, Kubernetes, infrastructure configs
└── .github/        # CI/CD workflows
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS 10, Prisma ORM, PostgreSQL 16, Redis 7 |
| **Search** | Elasticsearch 8 |
| **AI/ML** | Python FastAPI + LLM API |
| **Infrastructure** | Docker, Kubernetes, GitHub Actions |
| **Monitoring** | Grafana, Prometheus, Sentry |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Development

```bash
# 1. Clone & install
git clone https://github.com/kerja-id/kerja-id.git
cd kerja-id

# 2. Start infrastructure (DB, Redis, Elasticsearch)
cd infra && docker-compose up -d

# 3. Setup backend
cd ../backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# 4. Setup frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev

# 5. Open
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

## Modules

| # | Module | Status | Sprint |
|---|--------|--------|--------|
| 1 | Auth & Profile | 🚧 In Progress | 1-2 |
| 2 | Job Aggregator | ⏳ Pending | 3 |
| 3 | CV Optimizer | ⏳ Pending | 4 |
| 4 | JobTracker | ⏳ Pending | 5 |
| 5 | SkillGap Analyzer | ⏳ Pending | 7-8 |
| 6 | InterviewSim | ⏳ Pending | 9-10 |
| 7 | SalaryInsight | ⏳ Pending | 11-12 |
| 8 | ConnectPro | ⏳ Pending | 15-16 |
| 9 | MicroIntern | ⏳ Pending | 13-14 |
| 10 | JobWell | ⏳ Pending | 19-20 |
| 11 | KerjaDariMana | ⏳ Pending | 19-20 |

## License

Proprietary — KERJA.ID © 2026
