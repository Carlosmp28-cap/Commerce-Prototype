import React from "react";
import { fireEvent, act } from "@testing-library/react-native";
import * as RN from "react-native";

import PDPScreen from "../app/screens/PDP";
import { getProductById } from "../app/data/catalog";
import { renderWithProviders } from "../test/testUtils";

const mockAddItem = jest.fn();

jest.mock("../app/hooks/useCart", () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

describe("PDP - cart", () => {
  beforeEach(() => {
    mockAddItem.mockClear();
    jest.spyOn(RN, "useWindowDimensions").mockReturnValue({
      width: 375,
      height: 800,
      scale: 1,
      fontScale: 1,
    });
    // PDPQuantitySelector uses alert()
    (global as unknown as { alert?: jest.Mock }).alert = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("Add to Cart calls cart addItem (default quantity)", async () => {
    jest.useFakeTimers();

    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const product = getProductById("sku-new-001");
    expect(product).toBeTruthy();

    const { getByText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText("Add to Cart"));

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: product!.id }),
      1
    );
    expect((global as unknown as { alert?: jest.Mock }).alert).toHaveBeenCalled();
  });

  test("can select quantity and add to cart", async () => {
    jest.useFakeTimers();

    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const product = getProductById("sku-new-001");
    expect(product).toBeTruthy();

    const { getByText, getByLabelText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByLabelText("Select quantity"));
    fireEvent.press(getByText("2"));

    fireEvent.press(getByText("Add to Cart"));

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: product!.id }),
      2
    );
  });
});
