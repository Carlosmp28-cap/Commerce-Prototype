import { fireEvent, act } from "@testing-library/react-native";
import * as RN from "react-native";

import PDPScreen from "../app/screens/PDP";
import { getProductById } from "./fixtures/catalogMock";
import { renderWithProviders } from "../test/testUtils";

const mockAddItem = jest.fn();

jest.mock("../app/hooks/useCart", () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

jest.mock("../app/hooks/useProducts", () => {
  const actual = jest.requireActual("../app/hooks/useProducts");
  const { products: catalogProducts } = require("./fixtures/catalogMock");

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

describe("PDP - cart", () => {
  beforeEach(() => {
    mockAddItem.mockClear();
    jest.spyOn(RN, "useWindowDimensions").mockReturnValue({
      width: 375,
      height: 800,
      scale: 1,
      fontScale: 1,
    });
    // previous implementation used alert(); now we show a Snackbar instead
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
      <PDPScreen navigation={navigation} route={route} />,
    );

    fireEvent.press(getByText("Add to Cart"));

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: product!.id }),
      1,
    );
    // Snackbar with success message should be visible
    expect(getByText(/added to cart/)).toBeTruthy();
  });

  test("can select quantity and add to cart", async () => {
    jest.useFakeTimers();

    const navigation: any = { navigate: jest.fn(), push: jest.fn() };
    const route: any = { params: { id: "sku-new-001" } };

    const product = getProductById("sku-new-001");
    expect(product).toBeTruthy();

    const { getByText, getByLabelText } = renderWithProviders(
      <PDPScreen navigation={navigation} route={route} />,
    );

    fireEvent.press(getByLabelText("Select quantity"));
    fireEvent.press(getByText("2"));

    fireEvent.press(getByText("Add to Cart"));

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: product!.id }),
      2,
    );
  });
});
