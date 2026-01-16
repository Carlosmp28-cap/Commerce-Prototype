# Commerce Prototype (Expo + React Native)

Protótipo de e-commerce em Expo/React Native com uma estrutura inspirada em SFRA.

## Stack

- Expo SDK 54 + React Native
- TypeScript
- React Navigation (native-stack) com deep linking (web)
- React Native Paper (Material Design 3)
- Testes: Jest (`jest-expo`) + React Native Testing Library

Nota: este projeto **não usa** `expo-router` (sem file-based routing). O diretório `app/` aqui é apenas uma convenção interna do protótipo.

## Rodar localmente

Instalar dependências:

```bash
npm install
```

Iniciar app:

```bash
npx expo start
```

Atalhos úteis:

```bash
npm run android
npm run ios
npm run web
```

## Qualidade (lint/typecheck/tests)

Lint:

```bash
npm run lint
```

Typecheck:

```bash
npx tsc --noEmit
```

Testes:

```bash
npm test -- --runInBand
```

### Onde ficam os testes e por quê existe `test/testUtils.tsx`

- As suites de teste ficam em `__tests__/` e seguem `*.test.ts(x)`.
- O arquivo `test/testUtils.tsx` existe para centralizar o setup de render:
  - `renderWithProviders()` já envolve os componentes com providers usados no app (tokens/tema + Paper Provider).
  - Também define settings/mocks necessários para testes (ex.: ícones do Paper em ambiente Jest).

Manter esse helper fora de `__tests__/` evita que o Jest tente executá-lo como uma suite.

## Navegação

A navegação fica em `app/navigation/index.tsx`:

- Stack: `Home`, `PLP`, `PDP`, `Cart`, `Checkout`, `Login`
- O título do header é clicável e sempre leva para `Home`.
- Linking configurado via `expo-linking` (URLs tipo `/pdp/:id`, `/cart`, etc.).

## UI / Responsividade (web)

- O `Home` mantém o layout perfeito no mobile.
- Em telas largas (web), o topo do Home vira 2 colunas (hero/search à esquerda, promos à direita) para reduzir “espaço vazio” nas laterais.

## CI (GitHub Actions)

Há um workflow em `.github/workflows/ci.yml` na raiz do repo que executa lint, typecheck e testes.
