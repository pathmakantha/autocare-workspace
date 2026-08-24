# AutoCare FE

React Native (Expo, TypeScript) client for AutoCare — track vehicles, expiry dates, mileage, and maintenance history.

## Stack
- Expo SDK 51 / React Native 0.74
- TypeScript
- Redux Toolkit + react-redux
- React Navigation (native-stack + bottom-tabs)
- Axios (`src/api/client.ts`) for talking to `autocare-be`

## Getting started
```
npm install
npm start
```
Set `EXPO_PUBLIC_API_URL` to point at your running `autocare-be` instance. Defaults to `http://localhost:4000/api`.

## Structure
- `src/utils/theme.ts` — design tokens (colors, spacing, roundness, typography) from the AutoCare design handoff.
- `src/utils/vehicleStatus.ts` — `getVehicleStatus`, `getExpiringItems`, reminder urgency helpers.
- `src/components/` — `CustomButton`, `CustomInput`, `VehicleCard`.
- `src/redux/slices/` — auth, vehicles, maintenance, settings.
- `src/screens/` — Splash, Auth, Dashboard, VehicleList, AddVehicle, MaintenanceHistory, Reminders, Settings.
- `src/navigation/AppNavigator.tsx` — root stack + `MainTabNavigator` (Dashboard / Vehicles / Settings tabs).

## Notes
- Vehicles/maintenance records currently live in Redux state (in-memory) for the session. Wire `src/api/client.ts` into the vehicle/maintenance actions to persist against `autocare-be`.
- Guest mode caps the fleet at 1 vehicle per the design spec.
