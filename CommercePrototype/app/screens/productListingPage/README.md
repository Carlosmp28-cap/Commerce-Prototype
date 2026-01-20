# ProductListingPage Architecture

## Overview
This module implements the Product Listing Page (PLP) for both mobile and web platforms, following a modular, maintainable, and scalable architecture. All logic, styles, and components are organized to maximize code reuse and minimize duplication.

---

## Folder Structure

```
productListingPage/
├── components/                # (legacy, now empty)
├── index.tsx                  # (exports, if needed)
├── mobile/                    # Mobile-specific components and styles
│   └── components/            # All mobile UI components (PLPHeader, FilterModal, etc.)
├── PLPHeader.native.tsx       # Main mobile header entrypoint
├── PLPHeader.web.tsx          # Main web header entrypoint
├── shared/                    # Shared logic and types
│   ├── usePLPHeaderLogic.ts   # Shared hook for header logic
│   └── types/                 # Shared TypeScript types
├── styles/                    # Centralized styles
│   ├── PLPHeader.shared.styles.ts
│   └── ProductListingPage.styles.ts
├── web/                       # Web-specific components and styles
│   ├── components/            # All web UI components (PLPHeaderWeb, FilterMenuWeb, etc.)
│   └── styles/                # Web-only styles
```

---

## Architectural Principles

- **Separation by Platform:**
  - All mobile components live in `mobile/components`, all web components in `web/components`.
  - Shared logic (hooks, types) is in `shared/`.

- **Centralized Styles:**
  - Common styles are in `styles/PLPHeader.shared.styles.ts`.
  - Platform-specific overrides are in their respective folders.

- **Single Source of Truth:**
  - Data (ex: categories) is imported from a single location (`data/catalog.ts`).

- **Componentization:**
  - Each UI element (header, controls, modals) is a standalone component.
  - Exports are managed via `index.ts` files for easy imports.

- **Hooks for Logic:**
  - Shared business logic (sort/filter state, header props) is handled by hooks in `shared/`.

- **Type Safety:**
  - All props and state are typed via TypeScript interfaces in `shared/types`.

---

## Extending & Maintaining

- **Adicionar novo componente:**
  - Crie o componente em `mobile/components` ou `web/components` conforme a plataforma.
  - Exporte via `index.ts`.
  - Centralize estilos em `PLPHeader.shared.styles.ts` se forem comuns.

- **Adicionar lógica compartilhada:**
  - Crie hooks em `shared/`.
  - Tipos em `shared/types`.

- **Adicionar/alterar estilos:**
  - Edite `PLPHeader.shared.styles.ts` para estilos comuns.
  - Edite arquivos de estilos específicos para overrides.

- **Testes:**
  - Recomenda-se criar testes unitários para hooks e componentes principais.

---

## Pontos de Atenção

- **Evite duplicação:** Sempre que possível, compartilhe lógica e estilos entre plataformas.
- **Acessibilidade:** Garanta que todos os componentes tenham roles e labels apropriados.
- **Performance:** Use React.memo e hooks otimizados para listas grandes.
- **Documentação:** Mantenha este README atualizado conforme a arquitetura evolui.

---

## Exemplos de Importação

```tsx
// Importando header mobile
import PLPHeader from './mobile/PLPHeader.native';

// Importando header web
import PLPHeader from './PLPHeader.web';

// Importando componente compartilhado
import { usePLPHeaderLogic } from './shared/usePLPHeaderLogic';
```

---

## Contato
Dúvidas ou sugestões? Fale com o time de arquitetura/front-end.
