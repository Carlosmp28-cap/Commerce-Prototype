// Setup for Jest + React Native Testing Library
import "@testing-library/jest-native/extend-expect";

// Habilita matchers do jest-dom para testes web
import "@testing-library/jest-dom";

// Reduce noisy warnings from react-native-paper in tests.
const originalWarn = console.warn;
console.warn = (...args) => {
  const first = args[0];
  if (
    typeof first === "string" &&
    first.includes(
      "When setting overflow to hidden on Surface the shadow will not be displayed correctly"
    )
  ) {
    return;
  }
  originalWarn(...args);
};

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
  const IconMock = function IconMock(props) {
    return React.createElement("Icon", props);
  };
  return {
    __esModule: true,
    default: IconMock,
  };
});
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const IconMock = function IconMock(props) {
    return React.createElement("Icon", props);
  };
  return {
    __esModule: true,
    default: IconMock,
  };
});
jest.mock(
  "react-native-vector-icons/MaterialCommunityIcons",
  () => {
    const React = require("react");
    const IconMock = function IconMock(props) {
      return React.createElement("Icon", props);
    };
    return {
      __esModule: true,
      default: IconMock,
    };
  },
  { virtual: true }
);
jest.mock(
  "react-native-vector-icons/MaterialIcons",
  () => {
    const React = require("react");
    const IconMock = function IconMock(props) {
      return React.createElement("Icon", props);
    };
    return {
      __esModule: true,
      default: IconMock,
    };
  },
  { virtual: true }
);

// expo-linking is ESM in recent SDKs; mock to avoid Jest ESM parsing issues.
jest.mock("expo-linking", () => ({
  createURL: () => "test://",
}));

// AsyncStorage is a native module; mock it for Jest.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
