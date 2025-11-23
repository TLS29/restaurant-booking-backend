# Restaurant Booking Backend

Backend API for the Restaurant Booking System - a multitenant reservation platform.

## Tech Stack

- Node.js 20 + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Docker & Docker Compose

---

## 🚀 Quick Start (Docker - Recommended)

**Prerequisites:** Only Docker and Docker Compose installed.

```bash
# 1. Clone the repo
git clone <repo-url>
cd restaurant-booking-backend

# 2. Start everything (DB + API)
npm run docker:up

# 3. Done! API running on http://localhost:3000
```

That's it! No need to install Node, PostgreSQL, or anything else.

---

## 🛠️ Setup Options

### Option 1: Full Docker (Easiest)

Everything runs in containers (DB + API):

```bash
npm run docker:up        # Start DB + API
npm run docker:down      # Stop everything
npm run docker:logs      # View API logs
npm run docker:rebuild   # Rebuild containers
```

### Option 2: Docker DB + Local API (Development)

Run only DB in Docker, API locally (for better debugging):

```bash
# 1. Start only database
npm run docker:db

# 2. Install dependencies locally
npm install

# 3. Copy environment file
cp .env.example .env
# DATABASE_URL will be: postgresql://postgres:postgres@localhost:5432/restaurant_booking

# 4. Run migrations
npm run db:migrate

# 5. Start dev server
npm run dev
```

### Option 3: Local Everything

If you have Node 20+ and PostgreSQL installed:

```bash
npm install
cp .env.example .env
# Edit .env with your local DB credentials
npm run db:migrate
npm run dev
```

---

## 📝 Available Scripts

### Development
- `npm run dev` - Run dev server with hot reload (TypeScript)
- `npm run build` - Build for production
- `npm start` - Run production server

### Database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (DB GUI)
- `npm run db:seed` - Seed database with test data

### Docker
- `npm run docker:up` - Start DB + API in Docker
- `npm run docker:down` - Stop Docker containers
- `npm run docker:db` - Start only DB in Docker
- `npm run docker:logs` - View API logs
- `npm run docker:rebuild` - Rebuild and restart

## Project Structure

Following **SOLID principles** (see [ARCHITECTURE.md](./ARCHITECTURE.md) for details):

```
src/
├── config/        # Configuration (DB, env)
├── domain/        # Business entities and rules
├── repositories/  # Data access layer (Prisma abstraction)
├── use-cases/     # Application business logic
├── controllers/   # HTTP request handlers
├── routes/        # API route definitions
├── middlewares/   # Custom middleware (auth, validation)
├── dto/           # Data Transfer Objects
└── utils/         # Helper functions
prisma/
├── schema.prisma  # Database schema
└── seed.js        # Database seeder
```

## API Endpoints

Coming soon...
