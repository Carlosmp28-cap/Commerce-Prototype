import { fireEvent } from "@testing-library/react-native";

import HomeScreen from "../app/screens/Home";
import { renderWithProviders } from "../test/testUtils";
// fixture required inside jest mock factories to avoid out-of-scope access

jest.mock("../app/hooks/useProducts", () => {
  const fixture = require("./fixtures/catalogMock");
  return {
    useProducts: () => ({
      products: fixture.products,
      loading: false,
      error: null,
    }),
  };
});

jest.mock("../app/hooks/useCategories", () => {
  const actual = jest.requireActual("../app/hooks/useCategories");
  const fixture = require("./fixtures/catalogMock");
  const cats = fixture.categories;
  return {
    ...actual,
    useCategories: () => ({
      categories: {
        id: "root",
        name: "root",
        children: cats.map((c: any) => ({
          id: c.id,
          name: c.label,
          children: [],
        })),
      },
      loading: false,
      error: null,
      refetch: () => {},
    }),
  };
});

describe("Home screen", () => {
  test("renders key sections and allows See all navigation", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "Home", name: "Home" };

    const { getByText, getByLabelText, queryByLabelText } = renderWithProviders(
      <HomeScreen navigation={navigation} route={route} />,
    );

    // Search moved to the global header (not on Home anymore)
    expect(queryByLabelText("Search products")).toBeNull();

    expect(getByText("Featured")).toBeTruthy();
    expect(getByText("Why shop with us")).toBeTruthy();

    fireEvent.press(getByLabelText("See all products"));
    expect(navigation.navigate).toHaveBeenCalledWith("PLP");
  });

  test("tapping a featured product opens PDP", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "Home", name: "Home" };

    const { getByLabelText } = renderWithProviders(
      <HomeScreen navigation={navigation} route={route} />,
    );

    fireEvent.press(getByLabelText("Open product Lightweight Tee"));
    expect(navigation.navigate).toHaveBeenCalledWith("PDP", {
      id: "sku-new-001",
    });
  });
});
