import { sortProducts } from "../app/scripts/helpers/productHelpers";
import type { SortOption } from "../app/types";
import { getProductsByQuery } from "./fixtures/catalogMock";
import type { CatalogProduct } from "./fixtures/catalogMock";

describe("PLP logic", () => {
  test("sortProducts sorts by name ascending", () => {
    const products = getProductsByQuery();
    const sorted = sortProducts(products, "name-asc");
    expect(sorted[0].name <= sorted[1].name).toBe(true);
  });

  test("sortProducts sorts by name descending", () => {
    const products = getProductsByQuery();
    const sorted = sortProducts(products, "name-desc");
    expect(sorted[0].name >= sorted[1].name).toBe(true);
  });

  test("sortProducts sorts by price ascending", () => {
    const products = getProductsByQuery();
    const sorted = sortProducts(products, "price-asc");
    expect(sorted[0].price <= sorted[1].price).toBe(true);
  });

  test("sortProducts sorts by price descending", () => {
    const products = getProductsByQuery();
    const sorted = sortProducts(products, "price-desc");
    expect(sorted[0].price >= sorted[1].price).toBe(true);
  });

  test("getProductsByQuery filters by category", () => {
    const men = getProductsByQuery("men");
    expect(men.every((p: CatalogProduct) => p.categoryId === "men")).toBe(true);
  });

  test("getProductsByQuery returns all for empty query", () => {
    const all = getProductsByQuery();
    expect(all.length).toBeGreaterThan(0);
  });

  test("getProductsByQuery returns empty for unknown category", () => {
    const result = getProductsByQuery("unknown-category");
    expect(result).toEqual([]);
  });

  test("sortProducts is stable for equal values", () => {
    const products = [
      { id: "1", name: "A", price: 10 },
      { id: "2", name: "A", price: 10 },
    ] as any;
    const sorted = sortProducts(products, "name-asc");
    expect(sorted).toEqual(products);
  });
});
