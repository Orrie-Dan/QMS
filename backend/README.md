# QMS Backend

TypeScript Express API using Prisma with MariaDB (MySQL driver). Provides auth, clients, quotations, settings, and reports endpoints.

## Setup

1. Create `.env` in `backend/` with:

```
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/qms
JWT_SECRET=your-strong-secret
PORT=4000
NODE_ENV=development
```

2. Install dependencies

```
npm install
```

3. Generate Prisma client and run migrations

```
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Seed data

```
npm run seed
```

5. Start dev server

```
npm run dev
```

## Endpoints

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- CRUD `/api/clients`
- CRUD `/api/quotations`
- GET/PUT `/api/settings` (PUT requires admin)
- GET `/api/reports/dashboard`

Authorize with `Authorization: Bearer <token>`.
