# AutoCare

**Precision Vehicle Concierge** — a fleet-tracking app for personal or small-fleet vehicle owners. Track vehicles, odometer readings, license/insurance/emission/service expiry dates, and maintenance history, with automatic status badges and upcoming-reminder alerts.

This is a monorepo with two projects:

| Path | What it is |
|---|---|
| [`autocare-fe/`](autocare-fe) | React Native (Expo) mobile/web client |
| [`autocare-be/`](autocare-be) | Express + PostgreSQL (Prisma) REST API |

## Features

- **Dashboard** — fleet overview, count of vehicles due soon, and a callout linking to the next expiring item.
- **Vehicle fleet** — add/edit/remove vehicles with brand, model, year, registration, and odometer (mileage); search by name, plate, or brand.
- **Automatic status badges** — every vehicle is scored `HEALTHY` / `DUE SOON` / `URGENT` from the nearest of its license, insurance, emission-test, and service-reminder dates (≤30 days = due soon, ≤7 days = urgent).
- **Reminders** — a dedicated screen listing every vehicle × expiry-field pair due within 30 days, soonest first, with a finer 7/14/30-day urgency pill.
- **Maintenance history** — per-vehicle service log (type, date, mileage, cost, notes) with Total Spent / Services / Avg Cost stats, sorted newest first.
- **Auth** — email/password, Google Sign-In (Firebase), or a local **Guest mode** (1 vehicle, stored on-device, no account required).
- **Settings** — per-threshold notification toggles (30/14/7/1 day before expiry) and push-notification opt-in.

## Tech stack

**Frontend** (`autocare-fe`)
- Expo SDK 51 / React Native 0.74, TypeScript
- Redux Toolkit + react-redux (state), AsyncStorage (guest-mode & settings persistence)
- React Navigation (native-stack + bottom-tabs)
- Firebase Auth + Google Sign-In, Axios for the API

**Backend** (`autocare-be`)
- Node.js + Express + TypeScript
- PostgreSQL via Prisma ORM
- JWT auth (bcrypt-hashed passwords) + Firebase Admin SDK (verifies Google ID tokens)
- Zod request validation

## Design reference

UI colors, type scale, and spacing come from the original `AutoCare.dc.html` design handoff and are codified as the source of truth in [`autocare-fe/src/utils/theme.ts`](autocare-fe/src/utils/theme.ts) — treat that file, not the HTML reference, as ground truth going forward.

## Getting started

### Prerequisites
- Node.js 18+ and Yarn
- PostgreSQL (local or hosted)
- [Expo Go](https://expo.dev/go) app (for testing on a physical device) or an iOS/Android simulator
- A Firebase project, if you want Google Sign-In working end to end (optional otherwise)

### 1. Backend

```bash
cd autocare-be
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, and (optional) Firebase Admin creds
yarn install
yarn prisma:migrate
yarn dev
```

Server listens on `http://localhost:4000` by default. Health check: `GET /health`.

### 2. Frontend

```bash
cd autocare-fe
cp .env.example .env   # EXPO_PUBLIC_API_URL + (optional) Firebase/Google config
yarn install
yarn start
```

Then open in Expo Go, an emulator, or the web build. `EXPO_PUBLIC_API_URL` defaults to `http://localhost:4000/api` — point it at your running backend (use your machine's LAN IP instead of `localhost` when testing on a physical device).

> Guest mode works with **no backend running at all** — it's entirely local (AsyncStorage) — useful for a quick UI check.

## Environment variables

See each project's `.env.example` for the full, commented list. Summary:

| Variable | Project | Required | Purpose |
|---|---|---|---|
| `DATABASE_URL` | be | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | be | ✅ | Signs session JWTs |
| `PORT` | be | — | API port (default `4000`) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | be | Only for Google Sign-In | Firebase Admin SDK service-account credentials |
| `EXPO_PUBLIC_API_URL` | fe | ✅ | Base URL of `autocare-be` |
| `EXPO_PUBLIC_FIREBASE_*` | fe | Only for Google Sign-In | Firebase web app config |
| `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | fe | Only for Google Sign-In | OAuth client IDs (iOS/Android need a custom dev client — not supported in Expo Go) |

## API overview

All vehicle/maintenance routes require `Authorization: Bearer <token>`.

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password }` |
| `POST` | `/api/auth/login` | `{ email, password }` |
| `POST` | `/api/auth/google` | `{ idToken }` — Firebase ID token |
| `GET` | `/api/auth/me` | Current user |
| `GET` / `POST` | `/api/vehicles` | List / create |
| `GET` / `PATCH` / `DELETE` | `/api/vehicles/:id` | Read / partial update / delete |
| `GET` / `POST` | `/api/vehicles/:vehicleId/records` | Maintenance records for a vehicle |
| `DELETE` | `/api/vehicles/:vehicleId/records/:recordId` | Delete a record |

Full request/response shapes: [`autocare-be/README.md`](autocare-be/README.md).

## Data model

`User` 1—N `Vehicle` 1—N `MaintenanceRecord`. See [`autocare-be/prisma/schema.prisma`](autocare-be/prisma/schema.prisma) for the authoritative schema.

## Scripts

| Command | Where | Does |
|---|---|---|
| `yarn dev` | `autocare-be` | Run the API with hot reload |
| `yarn typecheck` | either project | `tsc --noEmit` |
| `yarn prisma:migrate` | `autocare-be` | Apply/create a Prisma migration |
| `yarn start` | `autocare-fe` | Launch the Expo dev server |

## Project structure

```
autocare-workspace/
├── autocare-be/           Express API
│   ├── prisma/             schema + migrations
│   └── src/
│       ├── controllers/    auth, vehicle, maintenance
│       ├── routes/
│       ├── middleware/     auth guard, error handling
│       └── utils/          jwt helpers
└── autocare-fe/            Expo app
    └── src/
        ├── api/             axios client
        ├── components/      CustomButton, CustomInput, VehicleCard
        ├── navigation/      root stack + bottom tabs
        ├── redux/slices/    auth, vehicles, maintenance, settings
        ├── screens/         Splash, Auth, Dashboard, VehicleList,
        │                    AddVehicle, MaintenanceHistory, Reminders, Settings
        └── utils/           theme.ts (design tokens), vehicleStatus.ts
```
