# Commerce-Prototype

Projeto base para protótipo SFRA em React Native usando Expo.

Resumo rápido
- App principal está em `CommercePrototype/` — abra essa pasta para rodar e ver o `package.json`.
- Scaffold inicial implementa: navegação (Home, PLP, PDP, Cart), tema, hooks, serviços e testes básicos.

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
- `CommercePrototype/__tests__/` — testes Jest

Próximos passos sugeridos
- Implementar navegação completa e telas (Tarefa 2).
- Implementar API client + auth hooks e mocks (Tarefa 4).
- Implementar cache e persistência do carrinho (Tarefas 5 e 6).
- Configurar secrets no GitHub para deploys (EXPO_TOKEN, EAS_SERVICE_ACCOUNT, FIREBASE_TOKEN).

Se quiser, eu posso commitar mudanças pendentes e abrir um branch/PR com estas atualizações.