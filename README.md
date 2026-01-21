# Commerce-Prototype

Full-stack e-commerce prototype with React Native (Expo) frontend and ASP.NET Core backend integrated with Salesforce Commerce Cloud (SFCC).

## Project Structure

```
Commerce-Prototype/
├── CommercePrototype/          # React Native (Expo) frontend
├── CommercePrototype-Backend/  # ASP.NET Core Web API backend
├── Docs/                       # Documentation and diagrams
└── postman/                    # Postman collections and environments
```

## Quick Start

### Frontend (CommercePrototype)

```bash
cd CommercePrototype
npm install
npx expo start
```

See [CommercePrototype/README.md](CommercePrototype/README.md) for details.

### Backend (CommercePrototype-Backend)

```bash
cd CommercePrototype-Backend
dotnet restore
dotnet run
```

Default URLs:
- HTTP: `http://localhost:5035`
- HTTPS: `https://localhost:7270`

See [CommercePrototype-Backend/README.md](CommercePrototype-Backend/README.md) for details.

## Architecture

### Frontend
- React Native + Expo (cross-platform: iOS, Android, Web)
- TypeScript for type safety
- React Navigation for routing
- React Native Paper (Material Design 3)
- Context API for cart management
- Jest + React Native Testing Library for testing

### Backend
- ASP.NET Core 10.0 Web API
- MVC architecture with service layer
- SFCC Shop API integration via OCAPI
- Dependency injection for services
- RESTful API design

### Integration
- Backend acts as a BFF (Backend for Frontend) layer
- Maps SFCC Shop API responses to frontend-friendly DTOs
- Handles authentication and API calls to SFCC
- Provides unified REST endpoints for products, categories, and cart

## API Endpoints

### Products
- `GET /api/products` - Search products (supports `q`, `categoryId`, `limit`, `offset` query params)
- `GET /api/products/{id}` - Get product details

### Categories
- `GET /api/categories` - Get category tree (supports `rootId`, `levels` query params)

### Health
- `GET /health` - Health check endpoint

## Configuration

### Backend SFCC Configuration

Update `CommercePrototype-Backend/appsettings.Development.json`:

```json
{
  "Sfcc": {
    "OAuthTokenUrl": "https://account.demandware.com/dw/oauth2/access_token",
    "ApiBaseUrl": "https://your-instance.dx.commercecloud.salesforce.com",
    "ApiVersion": "v20_4",
    "ClientId": "your-client-id",
    "SiteId": "RefArch"
  }
}
```

See [SFCC_INTEGRATION_GUIDE.md](CommercePrototype-Backend/SFCC_INTEGRATION_GUIDE.md) for detailed setup instructions.

## Testing

### Frontend Tests
```bash
cd CommercePrototype
npm test -- --runInBand
```

### Backend Tests
```bash
cd CommercePrototype-Backend
dotnet test
```

## CI/CD

GitHub Actions workflow configured in `.github/workflows/ci.yml`:
- Frontend: lint, typecheck, tests
- Backend: build, tests (when added)

## Development Workflow

1. **Backend Development**: Start the backend API first to ensure endpoints are available
2. **Frontend Development**: Configure API base URL in frontend to point to local backend
3. **Testing**: Run tests in both projects before committing
4. **Commits**: Follow conventional commit messages

## Next Steps

- [ ] Implement cart/basket endpoints in backend
- [ ] Implement order creation workflow
- [ ] Add authentication/customer endpoints
- [ ] Connect frontend to backend API
- [ ] Add comprehensive error handling
- [ ] Implement caching strategy
- [ ] Add monitoring and logging
- [ ] Configure production deployments

## Documentation

- [SFCC Integration Guide](CommercePrototype-Backend/SFCC_INTEGRATION_GUIDE.md)
- [Frontend README](CommercePrototype/README.md)
- [Backend README](CommercePrototype-Backend/README.md)
