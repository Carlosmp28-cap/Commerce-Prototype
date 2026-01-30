import { CartLine } from "@/app/screens/Checkout/components/OrderSummary";
import ReviewCard from "../app/screens/Checkout/components/ReviewCard";
import { renderWithProviders } from "../test/testUtils";

describe("ReviewCard", () => {
  const mockItems = [
    {
      product: {
        id: "1",
        name: "Item A",
        price: 10,
      },
      quantity: 2,
    },
    {
      product: {
        id: "2",
        name: "Item B",
        price: 5.5,
      },
      quantity: 1,
    },
  ] as unknown as CartLine[];

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
        items={mockItems}
        subtotal={25.5}
        shippingCost={5}
        total={30.5}
      />,
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
