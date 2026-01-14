# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Testes e CI (projeto)

Instruções rápidas para rodar os testes e o CI localmente nesta cópia do repositório.

- O código fonte da aplicação está dentro da pasta `CommercePrototype`.
- Comandos abaixo devem ser executados a partir da raiz do projeto `CommercePrototype` (onde existe o `package.json`).

Instalar dependências:

```bash
npm install
```

Rodar a app (desenvolvimento):

```bash
npx expo start
```

Rodar a suite de testes (Jest + React Native Testing Library):

```bash
npm test -- --runInBand
```

Notas sobre a configuração de testes:

- Usamos `jest-expo` como preset, com mocks mínimos para `expo`.
- Se ocorrerem erros relacionados a versões de `react-test-renderer`, instale a versão compatível com o `react` do projeto (ex.: `npm install -D react-test-renderer@19.1.0`).

CI — GitHub Actions

Há um workflow em `.github/workflows/ci.yml` configurado para executar dentro da pasta `CommercePrototype`:

- Passos: instalar dependências (`npm ci` ou `npm install`), `npm run lint`, `npx tsc --noEmit`, e `npm test`.
- Para deploys/Expo/EAS adicione secrets no repositório: `EXPO_TOKEN`, `EAS_SERVICE_ACCOUNT`, `FIREBASE_TOKEN`.

Comandos úteis para CI local (simulação rápida):

```bash
# instalar deps na pasta CommercePrototype
cd CommercePrototype && npm ci

# rodar lint
cd CommercePrototype && npm run lint

# rodar typecheck
cd CommercePrototype && npx tsc --noEmit

# rodar testes
cd CommercePrototype && npm test -- --runInBand
```

Se quiser, eu adiciono também um workflow separado para releases via EAS/Expo.
