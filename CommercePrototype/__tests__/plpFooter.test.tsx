import PLPScreen from "../app/screens/PLP";
import { renderWithProviders } from "../test/testUtils";

jest.mock("../app/hooks/useCategories", () => {
  const actual = jest.requireActual("../app/hooks/useCategories");
  return {
    ...actual,
    useCategories: () => ({ categories: [], loading: false, error: null }),
  };
});

jest.mock("../app/hooks/useProducts", () => {
  const actual = jest.requireActual("../app/hooks/useProducts");
  return {
    ...actual,
    useProductsPaginated: () => ({
      products: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
      isLoadingMore: false,
      total: 0,
    }),
  };
});

describe("PLP screen", () => {
  test("includes footer", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "PLP", name: "PLP", params: undefined };

    const { getByText } = renderWithProviders(
      <PLPScreen navigation={navigation} route={route} />,
    );

    expect(getByText(/Commerce Prototype/)).toBeTruthy();
  });
});
