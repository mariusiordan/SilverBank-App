# SilverBank

> A full-stack banking application built as the target workload for a DevOps capstone project. SilverBank provides core personal finance features — account management, transactions, money transfers, and cash tracking — and serves as a realistic 3-tier application to demonstrate a production-grade CI/CD ecosystem.

---

## Table of Contents

- [Purpose](#purpose)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [CI/CD Integration](#cicd-integration)

---

## Purpose

SilverBank was built specifically for the **DevOps Final Project** capstone. The application itself is intentionally straightforward — the primary objective is not the application code, but the infrastructure and delivery pipeline surrounding it.

The app provides a realistic workload with:
- A stateful backend requiring a persistent database
- JWT-based authentication requiring secure secret management
- Multi-tier architecture (frontend / backend / database) that exercises real deployment complexity
- A health endpoint that exposes deployment metadata for monitoring and rollback automation

---

## Features

- **User registration and login** — JWT authentication via HTTP-only cookies
- **Bank account management** — auto-generated IBAN, balance tracking
- **Transactions** — deposit, withdrawal, and transfer history
- **Money transfers** — send money between accounts
- **Cash tracker** — personal expense tracking with categories
- **Welcome bonus** — automatically credited on first login
- **Health endpoint** — returns status, database connection, environment, and image tag

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (React, TypeScript, Tailwind CSS) |
| Backend | Express.js (TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Testing | Vitest |

---

## Architecture

SilverBank runs as three separate containers:

```
┌─────────────────────────────────────────────────┐
│                   Nginx (edge)                  │
│   /api/*  →  backend  :4000                     │
│   /*      →  frontend :3000                     │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  frontend   │  │   backend   │
│  Next.js    │  │  Express.js │
│  :3000      │  │  :4000      │
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                ┌──────────────┐
                │  PostgreSQL  │
                │  :5432       │
                └──────────────┘
```

On **production** (Proxmox), the database runs on a dedicated VM (`db-postgresql`). On **staging**, all three tiers run as local containers on the same VM using `docker-compose.staging.yml`.

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Login and receive JWT cookie | No |
| POST | `/api/auth/logout` | Clear JWT cookie | Yes |
| DELETE | `/api/auth/delete` | Delete authenticated user | Yes |

### Account — `/api/account`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/account` | Get account details and balance | Yes |
| POST | `/api/account/transfer` | Transfer money to another account | Yes |
| POST | `/api/account/loan` | Request a loan | Yes |
| DELETE | `/api/account/close` | Close account | Yes |

### Transactions — `/api/transactions`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/transactions` | Get transaction history | Yes |

### Cash Tracker — `/api/cash`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/cash` | Get all cash entries | Yes |
| POST | `/api/cash` | Add a cash entry | Yes |
| DELETE | `/api/cash/:id` | Delete a cash entry | Yes |

### Health — `/api/health`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/health` | Application and database status | No |

```json
{
  "status": "ok",
  "timestamp": "2026-03-23T21:19:12.526Z",
  "database": "connected",
  "version": "1.0.0",
  "environment": "blue",
  "image_tag": "v1.0-sha-abc1234"
}
```

The `environment` and `image_tag` fields are injected at deploy time via environment variables — they are used by the CI/CD pipeline for rollback monitoring and by Prometheus for deployment traceability.

---

## Database Schema

```
User
  ├── id, email (unique), password (bcrypt), name
  ├── bonusGranted (Boolean)
  ├── accounts   → Account[]
  └── cashEntries → CashEntry[]

Account
  ├── id, iban (unique), balance, bonusGranted
  ├── userId → User
  └── transactions → Transaction[]

Transaction
  ├── id, type, amount, description
  ├── createdAt
  └── accountId → Account

CashEntry
  ├── id, description, amount, category
  ├── createdAt
  └── userId → User
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker Compose)
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/mariusiordan/SilverBank-App.git
cd SilverBank-App/silver-bank

# Install dependencies
npm install

# Start local database (PostgreSQL + backend + frontend)
docker compose up -d

# Apply database migrations
cd backend
npx prisma migrate deploy
npx prisma generate

# Start development server
cd ..
npm run dev
```

The application will be available at `http://localhost:3000`.

### Docker Compose (local)

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down
```

---

## Testing

Tests are written with **Vitest** and cover JWT token handling, authentication flows, and account management.

```bash
cd silver-bank

# Run all tests
npx vitest run

# Run specific test suite
npx vitest run __tests__/jwt.test.ts
npx vitest run __tests__/login.test.ts
npx vitest run __tests__/register.test.ts
npx vitest run __tests__/account.test.ts

# Run with coverage
npx vitest run --coverage
```

Auth and Account tests require a running database. In CI, they run inside a Docker container to ensure a consistent environment.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/appdb` |
| `JWT_SECRET` | Secret key for JWT signing | `K7x9mN2pQrL5vB8w...` |
| `PORT` | Backend server port | `4000` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `DEPLOY_ENV` | Active Blue/Green environment | `blue` or `green` |
| `IMAGE_TAG` | Docker image tag for this deployment | `v1.0-sha-abc1234` |

`DEPLOY_ENV` and `IMAGE_TAG` are injected automatically by Ansible at deploy time — they are surfaced via `/api/health` and used by the rollback monitor.

---

## CI/CD Integration

SilverBank is deployed through a three-pipeline CI/CD ecosystem defined in `.github/workflows/`:

| Pipeline | File | Trigger | Purpose |
|---|---|---|---|
| CI | `test.yml` | Pull Request | Lint + parallel unit tests + PR comment on failure |
| Staging | `staging.yml` | Push to `staging` | Build images, deploy to staging, integration tests |
| Production | `deploy.yml` | Push to `main` | Promote image, manual approval, Blue/Green deploy |

### Image Tags

Images are tagged as `v{MAJOR}.{MINOR}-sha-{git-sha}` — no dates, no rebuilds between environments. The same image built on staging is promoted to production unchanged.

```
v1.0-sha-abc1234   ← staging build
        │
        ▼ promote (retag, no rebuild)
v1.0-sha-abc1234   ← production deploy
        │
        ▼ after 10-minute health check
:latest            ← AWS DR pulls this tag
```

For full infrastructure documentation, see the [infrastructure repository](https://github.com/mariusiordan/DevOps-final-project).
