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

-- **Single Source of Truth:**

- Data (ex: categories) should come from API-backed hooks like `useCategories()` or test fixtures; the old `data/catalog.ts` has been removed.

- **Componentization:**
  - Each UI element (header, controls, modals) is a standalone component.
  - Exports are managed via `index.ts` files for easy imports.

- **Hooks for Logic:**
  - Shared business logic (sort/filter state, header props) is handled by hooks in `shared/`.

- **Type Safety:**
  - All props and state are typed via TypeScript interfaces in `shared/types`.

---

## Extending & Maintaining

- Adding a new component:
  - Create the component in `mobile/components` or `web/components` depending on the target.
  - Export via `index.ts` for easy imports.
  - Centralize shared styles in `styles/PLPHeader.shared.styles.ts` when appropriate.

- Shared logic:
  - Add hooks to `shared/` and types to `shared/types`.

- Styles:
  - Update `styles/PLPHeader.shared.styles.ts` for common styles and platform-specific overrides in their folders.

- Tests:
  - Add unit tests for hooks and key components.

---

## Notes

- Avoid duplication: prefer shared hooks and styles between platforms.
- Accessibility: ensure components expose proper roles and accessibility labels.
- Performance: use `React.memo` and optimized hooks for large lists.
- Documentation: keep this README up to date as the architecture evolves.

---

## Import examples

```tsx
// Import mobile header
import PLPHeader from "./mobile/PLPHeader.native";

// Import web header
import PLPHeader from "./PLPHeader.web";

// Import shared hook
import { usePLPHeaderLogic } from "./shared/usePLPHeaderLogic";
```

---
