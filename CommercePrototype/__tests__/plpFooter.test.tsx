import React from "react";

import PLPScreen from "../app/screens/PLP";
import { renderWithProviders } from "../test/testUtils";

describe("PLP screen", () => {
  test("includes footer", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "PLP", name: "PLP", params: undefined };

    const { getByText } = renderWithProviders(
      <PLPScreen navigation={navigation} route={route} />
    );

    expect(getByText(/Commerce Prototype/)).toBeTruthy();
  });
});
