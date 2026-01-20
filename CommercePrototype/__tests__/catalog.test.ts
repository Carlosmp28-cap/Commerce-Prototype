import {
  categories,
  getFeaturedProducts,
  getProductById,
  getProductsByQuery,
  products,
} from "../app/data/catalog";

describe("catalog", () => {
  test("has 5 categories", () => {
    expect(categories).toHaveLength(5);
    expect(categories.map((c) => c.id)).toEqual([
      "new",
      "men",
      "women",
      "sale",
      "new arrivals"
    ]);
  });

  test("has products", () => {
    expect(products.length).toBeGreaterThan(0);
  });

  test("getProductById returns a product when it exists", () => {
    expect(getProductById("sku-new-001")?.id).toBe("sku-new-001");
  });

  test("getProductById returns undefined when missing", () => {
    expect(getProductById("does-not-exist")).toBeUndefined();
  });

  test("getProductsByQuery returns all products for empty query", () => {
    expect(getProductsByQuery(undefined)).toHaveLength(products.length);
    expect(getProductsByQuery("")).toHaveLength(products.length);
    expect(getProductsByQuery("   ")).toHaveLength(products.length);
  });

  test("getProductsByQuery supports category queries", () => {
    const men = getProductsByQuery("men");
    expect(men.length).toBeGreaterThan(0);
    expect(men.every((p) => p.categoryId === "men")).toBe(true);
  });

  test("getProductsByQuery supports free-text search", () => {
    const sneakers = getProductsByQuery("sneaker");
    expect(sneakers.length).toBeGreaterThan(0);
    expect(sneakers.some((p) => p.name.toLowerCase().includes("sneaker"))).toBe(
      true
    );
  });

  test("getFeaturedProducts returns a stable curated list", () => {
    const featured = getFeaturedProducts();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.map((p) => p.id)).toEqual([
      "sku-new-003",
      "sku-men-001",
      "sku-women-004",
      "sku-sale-002",
      "sku-new-001",
    ]);
  });
});
