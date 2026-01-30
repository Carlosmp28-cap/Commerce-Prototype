import { fireEvent } from "@testing-library/react-native";

import PDPImageGallery from "../app/screens/PDP/components/PDPImageGallery";
import { renderWithProviders } from "../test/testUtils";

describe("PDP - image gallery", () => {
  test("opens and closes zoom modal (mobile)", () => {
    const images = [
      { uri: "https://picsum.photos/seed/test-1/800/800" },
      { uri: "https://picsum.photos/seed/test-2/800/800" },
    ];

    const { getByLabelText, queryByLabelText } = renderWithProviders(
      <PDPImageGallery images={images} isDesktop={false} />,
    );

    expect(queryByLabelText("Close image zoom")).toBeNull();

    fireEvent.press(getByLabelText("Open image zoom"));
    expect(getByLabelText("Close image zoom")).toBeTruthy();

    fireEvent.press(getByLabelText("Close image zoom"));
    expect(queryByLabelText("Close image zoom")).toBeNull();
  });

  test("can select a thumbnail (mobile)", () => {
    const images = [
      { uri: "https://picsum.photos/seed/test-1/800/800" },
      { uri: "https://picsum.photos/seed/test-2/800/800" },
      { uri: "https://picsum.photos/seed/test-3/800/800" },
    ];

    const { getByLabelText } = renderWithProviders(
      <PDPImageGallery images={images} isDesktop={false} />,
    );

    fireEvent.press(getByLabelText("Select image 2"));
    fireEvent.press(getByLabelText("Select image 3"));
  });
});
