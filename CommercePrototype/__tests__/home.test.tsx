import React from "react";
import { fireEvent } from "@testing-library/react-native";

import HomeScreen from "../app/screens/Home";
import { categories } from "../app/data/catalog";
import { renderWithProviders } from "../test/testUtils";

describe("Home screen", () => {
  test("renders key sections and supports search submit", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "Home", name: "Home" };

    const { getByLabelText } = renderWithProviders(
      <HomeScreen navigation={navigation} route={route} />
    );

    // Searchbar
    const search = getByLabelText("Search products");
    fireEvent.changeText(search, "  sneaker ");
    fireEvent(search, "submitEditing");

    expect(navigation.navigate).toHaveBeenCalledWith("PLP", { q: "sneaker" });
  });

  test("category chip navigates to PLP", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "Home", name: "Home" };

    const firstCategory = categories[0];

    const { getByLabelText } = renderWithProviders(
      <HomeScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByLabelText(`Open category ${firstCategory.label}`));
    expect(navigation.navigate).toHaveBeenCalledWith("PLP", {
      q: firstCategory.query,
    });
  });
});
