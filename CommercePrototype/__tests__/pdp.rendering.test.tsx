import React from "react";
import * as RN from "react-native";

import PDPScreen from "../app/screens/PDP";
import { renderWithProviders } from "../test/testUtils";

jest.mock("../app/hooks/useCart", () => ({
  useCart: () => ({
    addItem: jest.fn(),
  }),
}));

describe("PDP - rendering", () => {
  beforeEach(() => {
    jest.spyOn(RN, "useWindowDimensions").mockReturnValue({
      width: 375,
      height: 800,
      scale: 1,
      fontScale: 1,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders key product info (mobile)", () => {
    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const { getByText, getAllByText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    expect(getByText("Home")).toBeTruthy();
    expect(getAllByText("Lightweight Tee").length).toBeGreaterThan(0);
    expect(getByText(/€\s*18\.99/)).toBeTruthy();
    expect(getByText("Details")).toBeTruthy();
    expect(getByText("Related Products")).toBeTruthy();
  });

  test("renders shipping copy when product has shipping", () => {
    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const { getByText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    expect(getByText(/Standard shipping/i)).toBeTruthy();
    expect(getByText(/3-5 days/i)).toBeTruthy();
  });

  test("out of stock product hides quantity selector and shows Out of stock", () => {
    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-men-005" } };

    const { getByText, queryByText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    expect(getByText("Out of stock")).toBeTruthy();
    expect(queryByText("Add to Cart")).toBeNull();
  });

  test("unknown product id uses fallback product name", () => {
    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-unknown-999" } };

    const { getByText, getAllByText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    expect(getAllByText("Product sku-unknown-999").length).toBeGreaterThan(0);
    expect(getByText("Out of stock")).toBeTruthy();
  });

  test("renders desktop branch and still shows related products", () => {
    jest.spyOn(RN, "useWindowDimensions").mockReturnValue({
      width: 1024,
      height: 800,
      scale: 1,
      fontScale: 1,
    });

    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const { getByText, getAllByText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />
    );

    expect(getAllByText("Lightweight Tee").length).toBeGreaterThan(0);
    expect(getByText("Related Products")).toBeTruthy();
  });
});
