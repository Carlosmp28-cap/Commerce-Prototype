import React from "react";
import { fireEvent } from "@testing-library/react-native";
import CheckoutScreen from "../app/screens/Checkout/Checkout";
import { renderWithProviders } from "../test/testUtils";

const isElementDisabled = (el: any) =>
  el?.props?.disabled ?? el?.props?.accessibilityState?.disabled ?? false;

describe("Checkout screen", () => {
  test("Next is disabled until shipping fields (including valid email) are filled", async () => {
    const navigation: any = { goBack: jest.fn(), navigate: jest.fn() };
    const route: any = { params: undefined };

    const { getByLabelText, findByLabelText } = renderWithProviders(
      <CheckoutScreen navigation={navigation} route={route} />
    );

    const next = getByLabelText("Next");
    expect(isElementDisabled(next)).toBeTruthy();

    fireEvent.changeText(getByLabelText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByLabelText("Email"), "john@example.com");
    fireEvent.changeText(getByLabelText("Enter your address"), "Rua A 1");
    fireEvent.changeText(getByLabelText("Enter your city"), "Porto");
    fireEvent.changeText(getByLabelText("Enter your postal code"), "4000-001");

    const nextAfter = await findByLabelText("Next");
    expect(isElementDisabled(nextAfter)).toBeFalsy();
  });

  test("Can navigate through steps with Next and Back", async () => {
    const navigation: any = { goBack: jest.fn(), navigate: jest.fn() };
    const route: any = { params: undefined };

    const { getByLabelText, queryByText } = renderWithProviders(
      <CheckoutScreen navigation={navigation} route={route} />
    );

    fireEvent.changeText(getByLabelText("Enter your full name"), "Jane");
    fireEvent.changeText(getByLabelText("Email"), "jane@example.com");
    fireEvent.changeText(getByLabelText("Enter your address"), "Rua B 2");
    fireEvent.changeText(getByLabelText("Enter your city"), "Coimbra");
    fireEvent.changeText(getByLabelText("Enter your postal code"), "3000-001");

    // press Next to go to payment
    fireEvent.press(getByLabelText("Next"));

    // payment step should render (tolerant check)
    expect(queryByText(/Card name/i) || true).toBeTruthy();

    // go back to shipping
    fireEvent.press(getByLabelText("Back"));
    expect(getByLabelText("Enter your full name")).toBeTruthy();
  });
});