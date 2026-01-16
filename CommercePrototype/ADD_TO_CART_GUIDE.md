# Guia: Função Add to Cart para PDP

## Visão Geral

A lógica de adicionar produtos ao carrinho foi implementada com uma arquitetura completa usando:
- **Context API** com useReducer para gerenciar estado
- **Persistência** em storage (AsyncStorage)
- **TypeScript** para segurança de tipos
- **Validações** de quantidade disponível

## Estrutura

### 1. **CartContext.tsx** - Provedor e Lógica Principal
Localização: `app/store/CartContext.tsx`

Responsável por:
- Gerenciar o estado do carrinho com um reducer
- Persistir e restaurar carrinho do storage
- Exportar o hook `useCart()` com métodos tipados

**Ações suportadas:**
- `ADD_ITEM` - Adiciona produto ou incrementa quantidade
- `REMOVE_ITEM` - Remove produto do carrinho
- `UPDATE_QUANTITY` - Atualiza quantidade de um produto
- `CLEAR_CART` - Limpa todo o carrinho
- `REHYDRATE` - Restaura carrinho do storage

### 2. **useCart Hook** - Interface Pública
Localização: `app/hooks/useCart.tsx` (re-exporta de CartContext)

**Propriedades retornadas:**
```typescript
{
  items: CartItem[];           // Array de produtos no carrinho
  itemCount: number;           // Quantidade de produtos únicos
  totalQuantity: number;       // Quantidade total (soma de tudo)
  totalPrice: number;          // Preço total
  addItem(product, quantity);   // Adiciona ao carrinho
  removeItem(productId);        // Remove do carrinho
  updateQuantity(productId, quantity); // Atualiza quantidade
  clearCart();                 // Limpa o carrinho
}
```

### 3. **Storage** - Persistência
Localização: `app/utils/storage.ts`

Funções:
- `loadCart()` - Carrega carrinho do storage
- `saveCart(items)` - Salva carrinho no storage
- `clearCartStorage()` - Limpa carrinho do storage
- `getItem(key)` / `setItem(key, value)` - Helpers genéricos

## Como Usar na PDP

### Básico: Adicionar Produto

```tsx
import { useCart } from "../hooks/useCart";
import type { Product } from "../models/Product";

export default function PDPScreen() {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem(product, quantity);
    alert(`${quantity}x ${product.name} adicionado ao carrinho!`);
    setQuantity(1);
  };

  return (
    <Button onPress={handleAddToCart}>
      Adicionar ao Carrinho
    </Button>
  );
}
```

### Validações Automáticas

A função `addItem` valida automaticamente:
1. ✅ Quantidade > 0
2. ✅ Quantidade não excede stock disponível
3. ✅ Se produto já existe, incrementa ao invés de duplicar

```tsx
// Se produto já está no carrinho com qty=2 e adiciona qty=3:
addItem(product, 3); 
// Resultado: qty = 5 (ou menos se exceder stock)

// Se quantidade for inválida, nada acontece:
addItem(product, 0);        // ❌ Não adiciona
addItem(product, -5);       // ❌ Não adiciona
addItem(product, 9999);     // ⚠️ Adiciona apenas até stock disponível
```

## Fluxo Completo

```
PDP (showAddToCart)
    ↓
useCart.addItem(product, quantity)
    ↓
dispatch { type: "ADD_ITEM", product, quantity }
    ↓
Reducer:
  - Verifica se produto já existe
  - Se sim: incrementa quantidade (respeitando stock)
  - Se não: cria novo CartItem
    ↓
useEffect dispara saveCart() → AsyncStorage
    ↓
Estado atualizado
```

## Recuperação do Carrinho

Ao iniciar a app:
1. `CartProvider` monta
2. `useEffect` chama `rehydrate()`
3. `loadCart()` restaura do AsyncStorage
4. `REHYDRATE` action atualiza estado
5. Carrinho pronto para usar

```tsx
// App.tsx ou index.tsx
<CartProvider>
  <Navigation />
</CartProvider>
```

## Exemplo Completo na PDP

```tsx
import { useState } from "react";
import { Button, Text } from "react-native-paper";
import { useCart } from "../hooks/useCart";

export default function ProductDetailsScreen({ product }) {
  const { addItem, itemCount, totalPrice } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (product.quantityAvailable <= 0) {
      alert("Produto fora de estoque");
      return;
    }

    setIsAdding(true);
    
    // Simula delay de API/feedback visual
    setTimeout(() => {
      addItem(product, quantity);
      setIsAdding(false);
      
      alert(`✓ ${quantity}x ${product.name} adicionado!\n\nCarrinho: ${itemCount} itens | Total: R$ ${totalPrice.toFixed(2)}`);
      setQuantity(1);
    }, 300);
  };

  const handleIncreaseQty = () => {
    if (quantity < product.quantityAvailable) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <>
      <Text>{product.name}</Text>
      <Text>R$ {product.price}</Text>
      
      <Text>Quantidade disponível: {product.quantityAvailable}</Text>
      
      <Button 
        onPress={handleDecreaseQty}
        disabled={quantity <= 1}
      >
        −
      </Button>
      <Text>{quantity}</Text>
      <Button 
        onPress={handleIncreaseQty}
        disabled={quantity >= product.quantityAvailable}
      >
        +
      </Button>

      <Button 
        mode="contained"
        onPress={handleAddToCart}
        loading={isAdding}
        disabled={isAdding || product.quantityAvailable <= 0}
      >
        Adicionar ao Carrinho
      </Button>
    </>
  );
}
```

## Tipos TypeScript

```typescript
// CartItem - Modelo do item no carrinho
type CartItem = {
  product: Product;
  quantity: number;
};

// CartAction - Tipos de ações suportadas
type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "REHYDRATE"; items: CartItem[] };
```

## Arquivo Atual na PDP

O arquivo [app/screens/PDP.tsx](app/screens/PDP.tsx) já usa essa implementação:

```tsx
const { addItem } = useCart();

const handleAddToCart = () => {
  if (product.quantityAvailable > 0 && quantity > 0) {
    setIsAdding(true);
    setTimeout(() => {
      addItem(product, quantity);
      setIsAdding(false);
      alert(`${quantity}x ${product.name} adicionado ao carrinho!`);
      setQuantity(1);
    }, 300);
  }
};
```

## Próximos Passos (Opcional)

- [ ] Adicionar notificação visual (Toast) ao invés de alert()
- [ ] Integrar com API para atualizar stock em tempo real
- [ ] Adicionar animação ao adicionar ao carrinho
- [ ] Implementar histórico de carrinho
- [ ] Adicionar suporte a variações de produto (tamanho, cor, etc)
- [ ] Implementar carrinho compartilhado entre dispositivos (sync)
