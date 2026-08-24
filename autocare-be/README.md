# AutoCare BE

REST API backing the AutoCare app: user auth, vehicles, and maintenance records.

## Stack
- Node.js + Express + TypeScript
- PostgreSQL via Prisma
- JWT auth (bcrypt-hashed passwords)
- Zod request validation

## Getting started
```
cp .env.example .env   # then set DATABASE_URL and JWT_SECRET
npm install
npm run prisma:migrate
npm run dev
```
Server listens on `PORT` (default 4000). Health check: `GET /health`.

## API

### Auth
- `POST /api/auth/register` — `{ name, email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`

### Vehicles (all require `Authorization: Bearer <token>`)
- `GET /api/vehicles`
- `POST /api/vehicles` — `{ name, registrationNumber, vehicleType, brand, model, year, mileage, licenseExpiry, insuranceExpiry, emissionTestExpiry, serviceReminderDate }` (dates as `YYYY-MM-DD`)
- `GET /api/vehicles/:id`
- `PATCH /api/vehicles/:id` — partial update
- `DELETE /api/vehicles/:id`

### Maintenance records (nested under a vehicle)
- `GET /api/vehicles/:vehicleId/records`
- `POST /api/vehicles/:vehicleId/records` — `{ serviceType, serviceDate, mileage, cost, notes }`
- `DELETE /api/vehicles/:vehicleId/records/:recordId`

## Data model
See `prisma/schema.prisma` — `User` 1—N `Vehicle` 1—N `MaintenanceRecord`.
