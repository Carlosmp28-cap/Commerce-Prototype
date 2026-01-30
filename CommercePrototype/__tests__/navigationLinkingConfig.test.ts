import { HOME_TITLE, linkingConfig } from "../app/navigation";

describe("navigation config", () => {
  test("HOME_TITLE is set", () => {
    expect(HOME_TITLE).toBe("Commerce Prototype");
  });

  test("linking config exposes expected routes", () => {
    expect(linkingConfig.config?.screens).toMatchObject({
      Home: "home",
      PLP: "plp",
      PDP: "pdp/:id",
      Cart: "cart",
      Checkout: "checkout",
      Login: "login",
    });
  });
});
