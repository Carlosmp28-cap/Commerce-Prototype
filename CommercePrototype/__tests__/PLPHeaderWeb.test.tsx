import { render } from "@testing-library/react-native";
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
    expect(getByText("Products")).toBeTruthy();
    expect(getByText("10 items")).toBeTruthy();
  });

  it("updates the title when the prop changes", () => {
    const { rerender, getByText } = render(
      <PLPHeaderWebTitle {...defaultProps} />
    );
    rerender(<PLPHeaderWebTitle {...defaultProps} title="New Products" />);
    expect(getByText("New Products")).toBeTruthy();
  });

  it("does not render title if empty", () => {
    const { queryByText } = render(
      <PLPHeaderWebTitle {...defaultProps} title="" />
    );
    expect(queryByText("Products")).toBeNull();
  });

  it("does not render count if empty", () => {
    const { queryByText } = render(
      <PLPHeaderWebTitle {...defaultProps} countText="" />
    );
    expect(queryByText("10 items")).toBeNull();
  });
});
