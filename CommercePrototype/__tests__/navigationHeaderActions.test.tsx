import React from "react";
import { fireEvent } from "@testing-library/react-native";

import { HeaderActions, HeaderHomeButton } from "../app/navigation";
import { renderWithProviders } from "../test/testUtils";

describe("HeaderActions", () => {
  test("pressing icons navigates to PLP/Login/Cart", () => {
    const navigate = jest.fn();

    const { getByLabelText } = renderWithProviders(
      <HeaderActions navigation={{ navigate }} routeName="Home" />
    );

    fireEvent.press(getByLabelText("Search"));
    expect(navigate).toHaveBeenCalledWith("PLP");

    fireEvent.press(getByLabelText("Account"));
    expect(navigate).toHaveBeenCalledWith("Login");

    fireEvent.press(getByLabelText("Cart"));
    expect(navigate).toHaveBeenCalledWith("Cart");
  });

  test("Cart icon is hidden on Cart screen", () => {
    const navigate = jest.fn();

    const { queryByLabelText } = renderWithProviders(
      <HeaderActions navigation={{ navigate }} routeName="Cart" />
    );

    expect(queryByLabelText("Cart")).toBeNull();
  });
});

describe("HeaderHomeButton", () => {
  test("pressing title returns to Home via popToTop", () => {
    const popToTop = jest.fn();
    const navigate = jest.fn();

    const { getByLabelText } = renderWithProviders(
      <HeaderHomeButton navigation={{ popToTop, navigate }} />
    );

    fireEvent.press(getByLabelText("Go to Home"));
    expect(popToTop).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("falls back to navigate(Home) if popToTop is unavailable", () => {
    const navigate = jest.fn();

    const { getByLabelText } = renderWithProviders(
      <HeaderHomeButton navigation={{ navigate }} />
    );

    fireEvent.press(getByLabelText("Go to Home"));
    expect(navigate).toHaveBeenCalledWith("Home");
  });
});
