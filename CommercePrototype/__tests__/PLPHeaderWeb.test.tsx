import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { PLPHeaderWebTitle } from "../app/screens/productListingPage/web/components/PLPHeaderWeb";

describe("PLPHeaderWebTitle", () => {
  const defaultProps = {
    title: "Products",
    countText: "10 items",
    titleStyle: {},
    countStyle: {},
    onBackPress: jest.fn(),
  };

  it("renders the title and count", () => {
    render(<PLPHeaderWebTitle {...defaultProps} />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("10 items")).toBeInTheDocument();
  });

  it("updates the title when the prop changes", () => {
    const { rerender } = render(<PLPHeaderWebTitle {...defaultProps} />);
    rerender(<PLPHeaderWebTitle {...defaultProps} title="New Products" />);
    expect(screen.getByText("New Products")).toBeInTheDocument();
  });

  it("does not render title if empty", () => {
    render(<PLPHeaderWebTitle {...defaultProps} title="" />);
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
  });

  it("does not render count if empty", () => {
    render(<PLPHeaderWebTitle {...defaultProps} countText="" />);
    expect(screen.queryByText("10 items")).not.toBeInTheDocument();
  });
});
