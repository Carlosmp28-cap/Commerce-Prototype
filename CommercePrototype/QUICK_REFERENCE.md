# 🚀 Quick Reference: Add to Cart

## 3 Linhas de Código

```tsx
import { useCart } from "../hooks/useCart";

const { addItem } = useCart();
addItem(product, quantity);
```

---

## Arquitetura

```
┌─────────────────────────────────┐
│     app/screens/PDP.tsx         │
│   (usa useCart hook)            │
└────────────┬────────────────────┘
             │ addItem(product, qty)
             ↓
┌─────────────────────────────────┐
│  app/store/CartContext.tsx      │
│  (Provider + reducer logic)     │
└────────────┬────────────────────┘
             │ dispatch action
             ↓
┌─────────────────────────────────┐
│   Storage (app/utils)           │
│   (persist to memory/disk)      │
└─────────────────────────────────┘
```

---

## Hook API

### Importar
```tsx
import { useCart } from "../hooks/useCart";
```

### Usar
```tsx
const {
  // 📊 Dados
  items,          // CartItem[]
  itemCount,      // number (unique products)
  totalQuantity,  // number (sum of all quantities)
  totalPrice,     // number (total $)
  
  // 🎮 Ações
  addItem,        // (product, qty) => void
  removeItem,     // (productId) => void
  updateQuantity, // (productId, qty) => void
  clearCart,      // () => void
} = useCart();
```

---

## Exemplos

### ✅ Adicionar
```tsx
addItem(product, 3);
```

### ✅ Se já existe → incrementa
```tsx
addItem(product, 2); // qty = 2
addItem(product, 3); // qty = 5 ✅
```

### ✅ Validação automática
```tsx
addItem(product, 0);        // ❌ Nada
addItem(product, -5);       // ❌ Nada
addItem(product, 9999);     // ✅ Até stock máximo
```

### ✅ Remover
```tsx
removeItem(product.id);
```

### ✅ Atualizar quantidade
```tsx
updateQuantity(product.id, 5);
```

### ✅ Limpar carrinho
```tsx
clearCart();
```

### ✅ Verificar totalizações
```tsx
console.log(itemCount);      // 2
console.log(totalQuantity);  // 5
console.log(totalPrice);     // 299.99
```

---

## Tipos

```typescript
type CartItem = {
  product: Product;
  quantity: number;
};

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "REHYDRATE"; items: CartItem[] };
```

---

## PDP - Exemplo Completo

```tsx
import React, { useState } from "react";
import { Button } from "react-native-paper";
import { useCart } from "../hooks/useCart";
import type { Product } from "../models/Product";

type Props = { product: Product };

export default function PDPScreen({ product }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem(product, quantity);
    alert("Adicionado ao carrinho!");
    setQuantity(1);
  };

  return (
    <Button 
      mode="contained" 
      onPress={handleAddToCart}
      disabled={product.quantityAvailable <= 0}
    >
      Adicionar ao Carrinho
    </Button>
  );
}
```

---

## Storage

Funções disponíveis:
```tsx
import {
  loadCart,        // () => Promise<CartItem[] | null>
  saveCart,        // (items) => Promise<void>
  clearCartStorage,// () => Promise<void>
  getItem,         // (key) => Promise<any>
  setItem,         // (key, value) => Promise<void>
  removeItem,      // (key) => Promise<void>
} from "../utils/storage";
```

---

## Ficheiros

| Arquivo | Propósito |
|---------|-----------|
| `app/store/CartContext.tsx` | Provider + Reducer |
| `app/hooks/useCart.tsx` | Hook (re-exporta) |
| `app/utils/storage.ts` | Persistência |
| `ADD_TO_CART_GUIDE.md` | Documentação completa |
| `IMPLEMENTATION_SUMMARY.md` | Resumo da impl. |
| `__tests__/CartContext.test.tsx` | Testes |
| `app/screens/examples/AddToCartExample.tsx` | Exemplo component |

---

## Validações Automáticas ✅

A função `addItem()` valida:
- ✅ quantity > 0
- ✅ quantity <= quantityAvailable
- ✅ Não duplica (incrementa se já existe)
- ✅ Respeita stock máximo

**Você não precisa fazer validações extras!**

---

## Fluxo de Adicionar

```
handleAddToCart()
    ↓
addItem(product, qty)
    ↓
dispatch { type: "ADD_ITEM", product, qty }
    ↓
reducer:
  if (itemExists) {
    incrementQuantity()
  } else {
    createNewItem()
  }
    ↓
State atualizado
    ↓
useEffect → saveCart()
    ↓
Storage atualizado
    ↓
UI re-renderiza ✅
```

---

## Setup na App

```tsx
// App.tsx ou index.tsx
import { CartProvider } from "./app/store/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Navigation />
    </CartProvider>
  );
}
```

---

## Testar

```bash
npm test -- CartContext.test.tsx
```

---

## Status

✅ Implementado
✅ Testado
✅ Tipado
✅ Documentado
✅ Pronto para usar!

---

## Documentação

📖 [ADD_TO_CART_GUIDE.md](./ADD_TO_CART_GUIDE.md) - Guia completo
📖 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Resumo técnico
💡 [app/screens/examples/AddToCartExample.tsx](./app/screens/examples/AddToCartExample.tsx) - Componente exemplo
