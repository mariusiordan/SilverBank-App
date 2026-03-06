# 🏦 SilverBank

A modern full-stack digital banking application built with Next.js, PostgreSQL, and Prisma. Features instant transfers, loan requests, cash tracking, and full account management.

> Built as a 3-tier DevOps project: Presentation (Next.js) → Logic (API Routes) → Data (PostgreSQL)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | JWT (HTTP-only cookies) |
| Testing | Vitest |
| Containerization | Docker + Docker Compose |
| CI/CD | Jenkins (Pipeline-as-Code) |
| Infrastructure | Terraform (AWS EC2) + Ansible |

---

## ✨ Features

- 🔐 Register & Login with JWT authentication
- 🎉 Welcome bonus of £1,000 on signup
- 💸 Instant money transfers via IBAN
- 🏠 Loan requests
- 💵 Cash tracker (personal expense log by category)
- ❌ Account closure
- ❤️ Health check endpoint (`/api/health`)
- 📱 Smooth homepage with animations and testimonials

---

## 🏗️ Architecture (3-Tier)

```
┌─────────────────────────────────────────┐
│         Tier 1 - Presentation           │
│         Next.js + React (Port 3000)     │
├─────────────────────────────────────────┤
│         Tier 2 - Logic / API            │
│         Next.js API Routes              │
├─────────────────────────────────────────┤
│         Tier 3 - Data                   │
│         PostgreSQL 16 + Prisma ORM      │
└─────────────────────────────────────────┘
```

---

## 🚀 Running Locally (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (via Homebrew on macOS)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/silver-bank.git
cd silver-bank
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your local values:
```env
DATABASE_URL="postgresql://your-mac-username@localhost:5432/silverbank"
JWT_SECRET="your-secret-key"
```

### 4. Start PostgreSQL
```bash
brew services start postgresql@16
```

### 5. Run database migrations
```bash
npx prisma migrate dev
```

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: Prisma Studio (visual DB browser)
```bash
npx prisma studio
```
Opens at [http://localhost:5555](http://localhost:5555)

### Stop PostgreSQL
```bash
brew services stop postgresql@16
```

---

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode (development)
```bash
npm run test:watch
```

### Current test suite (12 tests)
```
✅ jwt.test.ts        (3 tests) - JWT sign/verify functions
✅ account.test.ts    (3 tests) - Account API endpoint
✅ register.test.ts   (3 tests) - Registration API endpoint
✅ login.test.ts      (3 tests) - Login API endpoint
```

### Lint
```bash
npm run lint
```

---

## 🐳 Running with Docker (Production)

### Prerequisites
- Docker Desktop installed and running

### 1. Build and start all services
```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** container on port `5432`
- **SilverBank app** on [http://localhost:3000](http://localhost:3000)

Migrations run automatically on startup.

### 2. Stop all services
```bash
docker-compose down
```

### 3. Full reset (removes all data)
```bash
docker-compose down -v
```

---

## ❤️ Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-06T22:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### Pipeline 1 — Continuous Integration
**Trigger:** Pull Request to `main`
```
Code Lint (ESLint)
    ↓
Unit Tests (Vitest)
    ↓
✅ Merge allowed / ❌ PR comment with errors
```

### Pipeline 2 — Staging Deployment
**Trigger:** Merge to `main`
```
Build Docker Image
    ↓
Push to GitHub Packages
    ↓
Deploy to Staging VM
    ↓
Integration Tests on Staging
```

### Pipeline 3 — Production Blue/Green
**Trigger:** Manual approval
```
Identify idle environment (Blue or Green)
    ↓
Deploy to idle environment
    ↓
Smoke Tests (/api/health)
    ↓
Switch Nginx traffic
    ↓
Monitor 10 min → Auto rollback if failure
```

---

## 🗄️ Database Management

### Run migrations
```bash
npx prisma migrate dev --name your-migration-name
```

### Reset database
```bash
npx prisma migrate reset
```

### Generate Prisma client
```bash
npx prisma generate
```

---

## 📁 Project Structure

```
silver-bank/
├── app/
│   ├── api/
│   │   ├── auth/         # login, register, logout, delete
│   │   ├── account/      # fetch user + account data
│   │   ├── transactions/ # transfers + loans
│   │   ├── cash/         # cash tracker CRUD
│   │   └── health/       # health check endpoint
│   ├── account/          # dashboard page + CashTracker
│   ├── login/            # login page
│   ├── signup/           # signup page
│   └── page.tsx          # homepage
├── __tests__/
│   ├── jwt.test.ts
│   ├── account.test.ts
│   ├── register.test.ts
│   └── login.test.ts
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── jwt.ts            # JWT sign/verify
├── prisma/
│   └── schema.prisma     # database schema
├── public/               # static assets
├── Dockerfile
├── docker-compose.yml
├── vitest.config.ts
└── .env.example
```

---

## 🔧 Uninstall PostgreSQL (macOS)

```bash
brew services stop postgresql@16
brew uninstall postgresql@16
rm -rf /opt/homebrew/var/postgresql@16
```

---

## 👤 Author

**Marius Iordan**
[LinkedIn](https://www.linkedin.com/in/mariusiordan/) · Built for DevOps final project