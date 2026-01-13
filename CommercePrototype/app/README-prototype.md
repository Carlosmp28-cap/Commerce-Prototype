# Protótipo SFRA — Estrutura inicial

Este diretório contém scaffolds iniciais para começar o protótipo SFRA em React Native.

Arquivos/folders criados (resumo):

- `navigation/` — ponto de entrada da navegação (React Navigation v6 recomendado).
- `screens/` — telas: `Home`, `PLP`, `PDP`, `Cart` (stubs).
- `components/` — componentes base: Button, Text, Card.
- `themes/` — tokens e `ThemeProvider` (`useTheme()` hook).
- `services/` — `api.ts`, `auth.ts`, `cache.ts` (esqueleto para axios/interceptors e cache).
- `hooks/` — `useAuth`, `useApi`, `useCart` (providers e hooks a implementar).
- `models/` — tipos: `Product`, `CartItem`.
- `utils/` — `storage.ts` wrapper para AsyncStorage/MMKV.

Próximos passos recomendados:

1. Instalar dependências: React Navigation, axios, AsyncStorage/MMKV, React Query (opcional), Firebase Analytics.
2. Implementar `navigation/index.tsx` com `NavigationContainer` e Stack/Tab.
3. Implementar `services/api.ts` com axios e interceptors de auth; conectar `useApi`.
4. Implementar `hooks/useCart.tsx` reducer + persistência (reidratar no boot).
5. Adicionar testes com Jest + React Native Testing Library.

Comandos úteis:

```bash
yarn install
npx expo start
```

Decisões iniciais sugeridas:

- Navigation: React Navigation v6 (native-stack)
- State: Context + useReducer para cart; evitar Redux para protótipo
- Storage: @react-native-async-storage/async-storage para começar; migrar para MMKV se necessário
- HTTP: axios com interceptors; considerar React Query para cache avançado
