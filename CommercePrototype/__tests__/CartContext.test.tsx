import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { CartProvider, useCart } from "../app/store/CartContext";
import type { Product } from "../app/models/Product";
import { View, Text, Pressable } from "react-native";

const mockProduct: Product = {
  id: "1",
  name: "Test Product",
  price: 99.99,
  quantityAvailable: 10,
  categoryId: "new",
};

function TestComponent() {
  const { items, addItem, removeItem, updateQuantity, totalPrice, totalQuantity, itemCount } = useCart();

  return (
    <View>
      <Pressable onPress={() => addItem(mockProduct, 1)} testID="add-btn">
        <Text>Add Item</Text>
      </Pressable>

      <Text testID="item-count">{itemCount}</Text>
      <Text testID="total-quantity">{totalQuantity}</Text>
      <Text testID="total-price">{totalPrice.toFixed(2)}</Text>

      {items.map((item) => (
        <Pressable
          key={item.product.id}
          onPress={() => removeItem(item.product.id)}
          testID={`remove-${item.product.id}`}
        >
          <Text>Remove {item.product.name}</Text>
        </Pressable>
      ))}

      {items.map((item) => (
        <Pressable
          key={`update-${item.product.id}`}
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          testID={`update-${item.product.id}`}
        >
          <Text>Update {item.product.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

describe("CartContext - Add to Cart", () => {
  describe("addItem", () => {
    it("should add a new item to cart", async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-btn");
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("item-count")).toHaveTextContent("1");
        expect(screen.getByTestId("total-quantity")).toHaveTextContent("1");
      });
    });

    it("should increment quantity if item already exists", async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-btn");
      
      fireEvent.press(addButton);
      await waitFor(() => {
        expect(screen.getByTestId("total-quantity")).toHaveTextContent("1");
      });

      fireEvent.press(addButton);
      await waitFor(() => {
        expect(screen.getByTestId("total-quantity")).toHaveTextContent("2");
        expect(screen.getByTestId("item-count")).toHaveTextContent("1");
      });
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart", async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-btn");
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("item-count")).toHaveTextContent("1");
      });

      const removeButton = screen.getByTestId(`remove-${mockProduct.id}`);
      fireEvent.press(removeButton);

      await waitFor(() => {
        expect(screen.getByTestId("item-count")).toHaveTextContent("0");
      });
    });
  });

  describe("Hook validation", () => {
    it("should throw error when useCart is used outside CartProvider", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useCart must be used within a CartProvider");

      spy.mockRestore();
    });
  });
});
