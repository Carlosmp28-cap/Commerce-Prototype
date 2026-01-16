// Setup for Jest + React Native Testing Library
import "@testing-library/jest-native/extend-expect";

// Optional: mock native modules here if needed

// Footer uses safe-area insets; make tests deterministic.
jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// React Native Paper icons (IconButton / Icon) rely on vector icon implementations.
// Mock them to a simple component so tests don't need native font loading.
// Paper tries multiple icon providers; ensure they all resolve in Jest.
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  const React = require("react");
  return {
    default: function IconMock(props) {
      return React.createElement("Icon", props);
    },
  };
});
jest.mock(
  "react-native-vector-icons/MaterialCommunityIcons",
  () => {
    const React = require("react");
    return {
      default: function IconMock(props) {
        return React.createElement("Icon", props);
      },
    };
  },
  { virtual: true }
);

// expo-linking is ESM in recent SDKs; mock to avoid Jest ESM parsing issues.
jest.mock("expo-linking", () => ({
  createURL: () => "test://",
}));
