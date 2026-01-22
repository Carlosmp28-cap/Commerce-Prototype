import React from "react";
import { fireEvent } from "@testing-library/react-native";
import * as RN from "react-native";

import PDPScreen from "../app/screens/PDP";
import { getProductById, products } from "../app/data/catalog";
import { renderWithProviders } from "../test/testUtils";

jest.mock("../app/hooks/useCart", () => ({
  useCart: () => ({
    addItem: jest.fn(),
  }),
}));

jest.mock("../app/hooks/useProducts", () => {
  const actual = jest.requireActual("../app/hooks/useProducts");
  const { products: catalogProducts } = require("../app/data/catalog");

  return {
    ...actual,
    useProductDetail: (id: string) => {
      const fallback = catalogProducts[0];
      const product = catalogProducts.find((p: any) => p.id === id) ?? {
        ...fallback,
        id,
        name: `Product ${id}`,
        quantityAvailable: 0,
      };

      return { product, loading: false, error: null };
    },
    useProducts: (categoryId: string) => {
      const related = catalogProducts.filter(
        (p: any) => p.categoryId === categoryId,
      );
      return { products: related, loading: false, error: null };
    },
  };
});

describe("PDP - navigation", () => {
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

  test("breadcrumb buttons navigate to Home and PLP", () => {
    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const { getByLabelText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />,
    );

    fireEvent.press(getByLabelText("Go home"));
    expect(navigation.navigate).toHaveBeenCalledWith("Home");

    fireEvent.press(getByLabelText("Open category New"));
    expect(navigation.navigate).toHaveBeenCalledWith("PLP", { q: "new" });
  });

  test("tapping a related product pushes PDP with its id", () => {
    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const current = getProductById("sku-new-001");
    expect(current).toBeTruthy();

    const firstRelated = products.find(
      (p) => p.categoryId === current!.categoryId && p.id !== current!.id,
    );
    expect(firstRelated).toBeTruthy();

    const { getByLabelText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />,
    );

    fireEvent.press(
      getByLabelText(`Open related product ${firstRelated!.name}`),
    );
    expect(navigation.push).toHaveBeenCalledWith("PDP", {
      id: firstRelated!.id,
    });
  });
});
