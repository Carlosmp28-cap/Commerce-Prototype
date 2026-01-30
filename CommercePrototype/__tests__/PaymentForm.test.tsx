import { fireEvent } from "@testing-library/react-native";
import PaymentForm from "../app/screens/Checkout/components/PaymentForm";
import { renderWithProviders } from "../test/testUtils";

describe("PaymentForm", () => {
  const noop = jest.fn();
  const baseProps = {
    paymentMethod: "card",
    setPaymentMethod: noop,
    cardName: "",
    setCardName: noop,
    cardNumber: "",
    setCardNumber: noop,
    expiry: "",
    setExpiry: noop,
    cvv: "",
    setCvv: noop,
    cardNumberError: false,
    setCardNumberError: noop,
    expiryError: false,
    setExpiryError: noop,
    cvvError: false,
    setCvvError: noop,
  } as any;

  it("calls setters when inputs change", () => {
    const setCardName = jest.fn();
    const setCardNumber = jest.fn();
    const setExpiry = jest.fn();
    const setCvv = jest.fn();

    const props = {
      ...baseProps,
      setCardName,
      setCardNumber,
      setExpiry,
      setCvv,
    };

    const { getByLabelText } = renderWithProviders(<PaymentForm {...props} />);

    // use actual accessibility labels rendered by the component
    fireEvent.changeText(
      getByLabelText("Enter your name on the card"),
      "Test User",
    );
    fireEvent.changeText(
      getByLabelText("Enter your card number"),
      "4242 4242 4242 4242",
    );
    fireEvent.changeText(
      getByLabelText("Enter your card expiry date"),
      "12/30",
    );
    fireEvent.changeText(getByLabelText("Enter your card CVV"), "123");

    expect(setCardName).toHaveBeenCalledWith("Test User");
    expect(setCardNumber).toHaveBeenCalledWith("4242424242424242");
    expect(setExpiry).toHaveBeenCalledWith("12/30");
    expect(setCvv).toHaveBeenCalledWith("123");
  });
});
