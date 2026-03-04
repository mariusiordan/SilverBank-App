#  SilverBank

A modern full-stack digital banking application built with Next.js, PostgreSQL, and Prisma. Features instant transfers, loan requests, cash tracking, and full account management.

> Built as a 3-tier DevOps project: Presentation (Next.js) → Logic (API Routes) → Data (PostgreSQL)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL 16 + Prisma ORM
- **Auth:** JWT (HTTP-only cookies)
- **DevOps:** Docker, Docker Compose

---

## ✨ Features

-  Register & Login with JWT authentication
-  Welcome bonus of £1,000 on signup
-  Instant money transfers via IBAN
-  Loan requests
-  Cash tracker (personal expense log by category)
-  Account closure
-  Smooth homepage with animations and testimonials

---

##  Running Locally (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (via Homebrew on macOS)

### 1. Clone the repository
```bash
git clone https://github.com/mariusiordan/SilverBank-App.git
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

## 🐳 Running with Docker (Production)

### Prerequisites
- Docker Desktop installed and running

### 1. Set up environment
```bash
cp .env.example .env.docker
```
The default `.env.docker` values work out of the box with docker-compose.

### 2. Build and start all services
```bash
docker-compose up --build
```

This will start:
- **PostgreSQL** container on port `5432`
- **SilverBank app** on [http://localhost:3000](http://localhost:3000)

Migrations run automatically on startup.

### 3. Stop all services
```bash
docker-compose down
```

### 4. Stop and remove all data (full reset)
```bash
docker-compose down -v
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

### Generate Prisma client (after schema changes)
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
│   │   └── cash/         # cash tracker CRUD
│   ├── account/          # dashboard page
│   ├── login/            # login page
│   ├── signup/           # signup page
│   └── page.tsx          # homepage
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── jwt.ts            # JWT sign/verify
├── prisma/
│   └── schema.prisma     # database schema
├── public/               # static assets
├── Dockerfile
├── docker-compose.yml
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