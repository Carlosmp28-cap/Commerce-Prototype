/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { PLPHeaderWebTitle } from "../app/screens/productListingPage/web/components";

describe("PLPHeaderWebTitle", () => {
  const defaultProps = {
    title: "Products",
    countText: "10 items",
    titleStyle: {},
    countStyle: {},
    onBackPress: jest.fn(),
  };

  it("renders the title and count", () => {
    const { getByText } = render(<PLPHeaderWebTitle {...defaultProps} />);
    expect(getByText("Products")).toBeInTheDocument();
    expect(getByText("10 items")).toBeInTheDocument();
  });

  it("updates the title when the prop changes", () => {
    const { rerender, getByText } = render(
      <PLPHeaderWebTitle {...defaultProps} />
    );
    rerender(<PLPHeaderWebTitle {...defaultProps} title="New Products" />);
    expect(getByText("New Products")).toBeInTheDocument();
  });

  it("does not render title if empty", () => {
    const { queryByText } = render(
      <PLPHeaderWebTitle {...defaultProps} title="" />
    );
    expect(queryByText("Products")).not.toBeInTheDocument();
  });

  it("does not render count if empty", () => {
    const { queryByText } = render(
      <PLPHeaderWebTitle {...defaultProps} countText="" />
    );
    expect(queryByText("10 items")).not.toBeInTheDocument();
  });
});
