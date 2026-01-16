import React from "react";

import { ScreenScroll } from "../app/layout/Screen";
import { renderWithProviders } from "../test/testUtils";

describe("ScreenScroll", () => {
  test("renders Footer after content", () => {
    const { getByText } = renderWithProviders(
      <ScreenScroll>{/* short content */}</ScreenScroll>
    );

    // Footer text includes current year.
    expect(getByText(/Commerce Prototype/)).toBeTruthy();
  });
});
