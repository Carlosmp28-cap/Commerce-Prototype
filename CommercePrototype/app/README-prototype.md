# Protótipo SFRA — Estrutura inicial

Este diretório contém a implementação atual do protótipo SFRA em React Native (Expo).

Arquivos/folders criados (resumo):

- `navigation/` — ponto de entrada da navegação (React Navigation native-stack) + deep linking.
- `screens/` — telas: `Home`, `PLP`, `PDP`, `Cart`, `Checkout`, `Login`.
- `components/` — componentes base: Button, Text, Card.
- `themes/` — tokens e `ThemeProvider` (`useTheme()` hook).
- `services/` — `api.ts`, `auth.ts`, `cache.ts` (esqueleto para axios/interceptors e cache).
- `hooks/` — `useAuth`, `useApi`, `useCart` (providers e hooks a implementar).
- `models/` — tipos: `Product`, `CartItem`.
- `utils/` — `storage.ts` wrapper para AsyncStorage/MMKV.
- `layout/` — wrappers de tela (inclui footer “SFRA-like” que rola com a página e fica no fim em páginas curtas).

Próximos passos recomendados:

1. Instalar dependências: React Navigation, axios, AsyncStorage/MMKV, React Query (opcional), Firebase Analytics.
2. Evoluir `navigation/index.tsx` (Stack + header actions + linking).
3. Implementar `services/api.ts` com axios e interceptors de auth; conectar `useApi`.
4. Implementar `hooks/useCart.tsx` reducer + persistência (reidratar no boot).
5. Adicionar testes com Jest + React Native Testing Library.

Comandos úteis:

```bash
yarn install
npx expo start
```

Decisões iniciais sugeridas:

- Navigation: React Navigation (native-stack) + linking no web
- State: Context + useReducer para cart; evitar Redux para protótipo
- Storage: @react-native-async-storage/async-storage para começar; migrar para MMKV se necessário
- HTTP: axios com interceptors; considerar React Query para cache avançado

Notas sobre testes

- Suites em `__tests__/` com arquivos `*.test.ts(x)`.
- Helpers compartilhados em `test/testUtils.tsx`.
  - `renderWithProviders()` envolve os componentes com os providers usados no app (tokens/tema + Paper Provider) e evita boilerplate repetido.
  - Mantemos fora de `__tests__/` para não ser executado como suite pelo Jest.

Notas sobre UI responsiva

- Home mantém uma experiência “mobile-first”.
- No web (telas largas), parte superior do Home usa layout em 2 colunas para reduzir espaços vazios laterais.
