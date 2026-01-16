import { getAvailabilityLabel, isAvailable } from "../app/utils/stock";

describe("stock helpers", () => {
  test("getAvailabilityLabel returns 'Out of Stock' for 0", () => {
    expect(getAvailabilityLabel(0)).toBe("Out of Stock");
  });

  test("getAvailabilityLabel returns 'Available' for positive quantities", () => {
    expect(getAvailabilityLabel(1)).toBe("Available");
    expect(getAvailabilityLabel(999)).toBe("Available");
  });

  test("isAvailable mirrors the same rule", () => {
    expect(isAvailable(0)).toBe(false);
    expect(isAvailable(5)).toBe(true);
  });
});
