# Commerce Prototype (Expo + React Native)

Frontend for the Commerce Prototype application. Targets mobile (iOS/Android) and web using Expo.

## Stack

- Expo SDK 54 + React Native
- TypeScript
- React Navigation (native-stack) with deep linking (web)
- React Native Paper (Material Design)
- Jest + React Native Testing Library for tests

Note: this prototype uses an `app/` directory for the Expo app (not `expo-router`).

## Quick start

Install dependencies:

```bash
npm install
```

Start the app (Metro/Dev server):

```bash
npx expo start
```

Useful commands (defined in `package.json`):

```bash
npm run android
npm run ios
npm run web
npm run web:export   # build web bundle
npm run web:serve    # serve exported bundle (uses npx serve)
```

Typecheck:

```bash
npx tsc --noEmit
```

Tests:

```bash
npm test -- --runInBand
```

Notes:

- This repository includes a `package-lock.json` to lock dependency versions.
- Some dev tools (linters/formatters) may be available via `npx` if not defined as npm scripts.

### Tests and utilities

- Test suites are in `__tests__/` and follow the `*.test.ts(x)` pattern.
- `test/testUtils.tsx` contains shared test helpers (for example `renderWithProviders()`) and is intentionally kept outside `__tests__/` to avoid being executed as a test file.

## Project structure (frontend)

```
CommercePrototype/
├── app/                    # Expo app source (screens, navigation, components)
│   ├── assets/             # static images and fonts
│   ├── navigation/         # app navigation and header
│   ├── screens/            # screen-level components (Home, PLP, PDP, etc.)
│   ├── services/           # typed API client and service helpers
│   ├── hooks/              # React hooks (useProducts, useCategories)
│   └── utils/              # UI helpers and mappers
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Navigation

Navigation is implemented in `app/navigation` and exposes the main stack used by the app:

- `Home`, `PLP` (product listing), `PDP` (product detail), `Cart`, `Checkout`, `Login`.

Deep linking is configured for web/mobile using `expo-linking`.

## UI / Responsiveness (web)

- The `Home` layout is optimized for mobile-first. On wide screens the layout adapts to a multi-column arrangement to better use available space.

## CI (GitHub Actions)

There is a workflow in `.github/workflows/ci.yml` (root) that runs typecheck and tests for the frontend.

## Running on device / emulator (LAN)

To test the mobile app against your local .NET backend from a physical device or emulators that don't share the host `localhost`, bind the backend to all interfaces and point Expo at your machine LAN IP.

1. Start the backend bound to all interfaces (allows other devices on your network to reach it):

```powershell
dotnet run --urls "http://0.0.0.0:5035"
```

2. Find your machine LAN IP (Windows):

```powershell
ipconfig
# note the IPv4 address for your active network adapter (e.g. X.X.X.X)
```

3. Create a local `.env` using `.env.example` and replace `<HOST_LAN_IP>`, or set the env var in your shell for one session.

PowerShell example (replace X.X.X.X):

```powershell
$env:EXPO_PUBLIC_API_URL="http://X.X.X.X:5035"
npx expo start --host lan
```

Or use the convenience npm script (edit `package.json` to replace `<HOST_LAN_IP>` first):

```bash
npm run start:dev:lan
```

Notes:

- For Android Studio AVD, you can use `http://10.0.2.2:5035` to reach the host's `localhost`.
- Genymotion uses `http://10.0.3.2:5035`.
- To avoid changing URLs in code, run `adb reverse tcp:5035 tcp:5035` and then `npm run android` to map emulator localhost to host localhost.
- Ensure Windows Firewall allows inbound TCP port `5035` on your network profile.
