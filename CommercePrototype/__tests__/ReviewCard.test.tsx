import React from "react";
import { render } from "@testing-library/react-native";
import ReviewCard from "../app/screens/Checkout/components/ReviewCard";
import { renderWithProviders } from "../test/testUtils";

describe("ReviewCard", () => {
  const mockItems = [
    { id: "1", title: "Item A", qty: 2, price: 10 },
    { id: "2", title: "Item B", qty: 1, price: 5.5 },
  ];

  it("renders customer, items and totals", () => {
    const { getByText, queryByText, getAllByText } = renderWithProviders(
      <ReviewCard
        fullName="John Doe"
        email="john@example.com"
        address="Rua X 1"
        city="Lisboa"
        postalCode="1000-001"
        country="Portugal"
        paymentMethod="card"
        cardName="John Doe"
        cardNumber="4242424242424242"
        mockItems={mockItems}
        subtotal={25.5}
        shippingCost={5}
        total={30.5}
      />
    );

    getByText("John Doe");
    getByText("john@example.com");
    getByText("Rua X 1");
    getByText(/Lisboa/);

    getByText("Item A × 2");
    getByText("Item B × 1");
    getByText("Subtotal");
    getByText("25.50 €");

    // use getAllByText because there are multiple "Shipping" elements in the DOM
    const shippings = getAllByText("Shipping");
    expect(shippings.length).toBeGreaterThan(0);

    getByText("5.00 €");
    getByText("Total");
    getByText("30.50 €");

    expect(queryByText(/••••/)).toBeTruthy();
  });
});