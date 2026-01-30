import { fireEvent, waitFor } from "@testing-library/react-native";

import { HeaderActions, HeaderHomeButton } from "../app/navigation";
import { renderWithProviders } from "../test/testUtils";

describe("HeaderActions", () => {
  test("Search opens modal; Account/Cart still navigate", async () => {
    const navigate = jest.fn();

    const { getByLabelText, getByText } = renderWithProviders(
      <HeaderActions navigation={{ navigate }} routeName="Home" />,
    );

    fireEvent.press(getByLabelText("Search"));
    expect(getByText("Search products")).toBeTruthy();

    fireEvent.changeText(getByLabelText("Search products"), "sneaker");
    fireEvent.press(getByText("Search"));

    await waitFor(() => {
      expect(getByText("Search not implemented")).toBeTruthy();
    });
    expect(
      getByText(
        /Missing implementation: search suggestions should use GET\s*\/search_suggestion\./i,
      ),
    ).toBeTruthy();

    fireEvent.press(getByLabelText("Account"));
    expect(navigate).toHaveBeenCalledWith("Login");

    fireEvent.press(getByLabelText("Cart"));
    expect(navigate).toHaveBeenCalledWith("Cart");
  });

  test("Cart icon is hidden on Cart screen", () => {
    const navigate = jest.fn();

    const { queryByLabelText } = renderWithProviders(
      <HeaderActions navigation={{ navigate }} routeName="Cart" />,
    );

    expect(queryByLabelText("Cart")).toBeNull();
  });
});

describe("HeaderHomeButton", () => {
  test("pressing title returns to Home via popToTop", () => {
    const popToTop = jest.fn();
    const navigate = jest.fn();

    const { getByLabelText } = renderWithProviders(
      <HeaderHomeButton navigation={{ popToTop, navigate }} />,
    );

    fireEvent.press(getByLabelText("Go to Home"));
    expect(popToTop).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test("falls back to navigate(Home) if popToTop is unavailable", () => {
    const navigate = jest.fn();

    const { getByLabelText } = renderWithProviders(
      <HeaderHomeButton navigation={{ navigate }} />,
    );

    fireEvent.press(getByLabelText("Go to Home"));
    expect(navigate).toHaveBeenCalledWith("Home");
  });
});
