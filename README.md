# Commerce-Prototype

Lightweight full-stack e-commerce prototype demonstrating an Expo + React Native frontend coupled with an ASP.NET Core backend that integrates with Salesforce Commerce Cloud (SFCC).

Repository layout

```
Commerce-Prototype/
├── CommercePrototype/          # Frontend (Expo + React Native)
├── CommercePrototype-Backend/  # Backend (ASP.NET Core 10)
├── docs/                       # Documentation and diagrams
└── postman/                    # Postman collections and environments
```

Quick start

Frontend (development):

```bash
cd CommercePrototype
npm install
npx expo start
```

Backend (development):

```bash
cd CommercePrototype-Backend
dotnet restore
dotnet run
```

Default backend base URL (development): `http://localhost:5035`

What’s included

- Frontend: Expo + React Native app (mobile + web), typed API client, per-feature component organization for Home/PLP/PDP.
- Backend: ASP.NET Core 10 API acting as a BFF for SFCC Shop API, DTO mapping, and API documentation via OpenAPI XML.

Testing

Frontend:

```bash
cd CommercePrototype
npm test -- --runInBand
```

Backend:

```bash
cd CommercePrototype-Backend
dotnet test
```

Notes

- SFCC configuration is stored in `CommercePrototype-Backend/.env` (copy from `.env.example` and fill values). See the backend README for details.
- The repository contains focused READMEs for frontend and backend: `CommercePrototype/README.md` and `CommercePrototype-Backend/README.md`.
