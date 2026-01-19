# Commerce-Prototype

Projeto base para protótipo SFRA em React Native usando Expo.

Resumo rápido

- App principal está em `CommercePrototype/` — abra essa pasta para rodar e ver o `package.json`.
- Implementa: catálogo determinístico, navegação (Home, PLP, PDP, Cart, Checkout, Login), tema (tokens + React Native Paper), footer “SFRA-like” e uma suite de testes (Jest + RNTL).

Como rodar localmente

1. Instalar dependências (na pasta `CommercePrototype`):

```bash
cd CommercePrototype
npm install
```

2. Iniciar app em dev (Expo):

```bash
npx expo start
```

Testes

- Suite Jest configurada com `jest-expo`. Para rodar localmente:

```bash
cd CommercePrototype
npm test -- --runInBand
```

Notas importantes sobre testes

- Os testes ficam em `CommercePrototype/__tests__/` e seguem o padrão `*.test.ts(x)`.
- Helpers compartilhados ficam fora de `__tests__/`, em `CommercePrototype/test/testUtils.tsx`.
  - Motivo: Jest trata arquivos dentro de `__tests__/` como suites; utilitários não devem ser executados como testes.
  - `renderWithProviders()` centraliza providers (tema/tokens + Paper Provider) e mocks necessários (ex.: ícones) para testes serem estáveis.

CI (GitHub Actions)

- Há um workflow em `.github/workflows/ci.yml` (na raiz) chamado `CI — CommercePrototype (lint, typecheck, test)`.
- O workflow executa os passos dentro da pasta `CommercePrototype` (instalação, lint, typecheck, tests).
- Para melhores caches e builds reprodutíveis, adicione e commit o `package-lock.json` dentro de `CommercePrototype`.

Estrutura relevante

- `CommercePrototype/app/` — código fonte Expo / routes
- `CommercePrototype/app/components/` — componentes base (Button, Text, Card)
- `CommercePrototype/app/screens/` — telas: Home, PLP, PDP, Cart
- `CommercePrototype/app/hooks/` — hooks: `useAuth`, `useApi`, `useCart`
- `CommercePrototype/app/services/` — `api`, `auth`, `cache` (esqueletos)
- `CommercePrototype/app/navigation/` — React Navigation (native-stack) + deep linking
- `CommercePrototype/__tests__/` — testes Jest
- `CommercePrototype/test/` — utilitários e wrappers para testes

Próximos passos sugeridos

- Implementar navegação completa e telas (Tarefa 2).
- Implementar API client + auth hooks e mocks (Tarefa 4).
- Implementar cache e persistência do carrinho (Tarefas 5 e 6).
- Configurar secrets no GitHub para deploys (EXPO_TOKEN, EAS_SERVICE_ACCOUNT, FIREBASE_TOKEN).

Se quiser, eu posso commitar mudanças pendentes e abrir um branch/PR com estas atualizações.
