import { fireEvent } from "@testing-library/react-native";

import LoginScreen from "../app/screens/Login";
import { renderWithProviders } from "../test/testUtils";

describe("Login (skeleton)", () => {
  test("renders placeholder copy", () => {
    const navigation: any = { goBack: jest.fn() };
    const route: any = { key: "Login", name: "Login" };

    const { getByText } = renderWithProviders(
      <LoginScreen navigation={navigation} route={route} />,
    );

    expect(getByText("Sign in")).toBeTruthy();
  });

  test("Back button calls navigation.goBack", () => {
    const navigation: any = { navigate: jest.fn() };
    const route: any = { key: "Login", name: "Login" };

    const { getByLabelText } = renderWithProviders(
      <LoginScreen navigation={navigation} route={route} />,
    );

    fireEvent.press(getByLabelText("Create account"));
    expect(navigation.navigate).toHaveBeenCalledWith("Register");
  });
});
