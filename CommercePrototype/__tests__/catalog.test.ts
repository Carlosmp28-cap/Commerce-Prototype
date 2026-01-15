import {
  categories,
  getFeaturedProducts,
  getProductById,
  getProductsByQuery,
  products,
} from "../app/data/catalog";

describe("catalog", () => {
  test("has 4 categories", () => {
    expect(categories).toHaveLength(4);
    expect(categories.map((c) => c.id)).toEqual([
      "new",
      "men",
      "women",
      "sale",
    ]);
  });

  test("has 20 products", () => {
    expect(products).toHaveLength(20);
  });

  test("getProductById returns a product when it exists", () => {
    expect(getProductById("sku-new-001")?.id).toBe("sku-new-001");
  });

  test("getProductById returns undefined when missing", () => {
    expect(getProductById("does-not-exist")).toBeUndefined();
  });

  test("getProductsByQuery returns all products for empty query", () => {
    expect(getProductsByQuery(undefined)).toHaveLength(20);
    expect(getProductsByQuery("")).toHaveLength(20);
    expect(getProductsByQuery("   ")).toHaveLength(20);
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
