import React from "react";
import { fireEvent } from "@testing-library/react-native";
import CheckoutScreen from "../app/screens/Checkout/Checkout";
import { renderWithProviders } from "../test/testUtils";

const isElementDisabled = (el: any) =>
  el?.props?.disabled ?? el?.props?.accessibilityState?.disabled ?? false;

describe("Shipping (via Checkout screen)", () => {
  test("shows email helper error when email is invalid and enables Next when valid", async () => {
    const navigation: any = { goBack: jest.fn(), navigate: jest.fn() };
    const route: any = { params: undefined };

    const { getByLabelText, getByText, findByLabelText } = renderWithProviders(
      <CheckoutScreen navigation={navigation} route={route} />
    );

    // invalid email shows helper text
    fireEvent.changeText(getByLabelText("Email"), "invalid-email");
    getByText("Insira um email válido.");

    // fill remaining fields with valid data -> Next enabled
    fireEvent.changeText(getByLabelText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByLabelText("Enter your address"), "Rua A 1");
    fireEvent.changeText(getByLabelText("Enter your city"), "Porto");
    fireEvent.changeText(getByLabelText("Enter your postal code"), "4000-001");
    fireEvent.changeText(getByLabelText("Email"), "john@example.com");

    const nextAfter = await findByLabelText("Next");
    expect(isElementDisabled(nextAfter)).toBeFalsy();
  });
});