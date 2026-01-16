module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  // Only treat explicit test files as suites.
  // This prevents shared helpers (e.g. test utils) from being executed just because they live under __tests__/.
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  setupFiles: [
    "<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|expo|expo-modules-core|@unimodules|@expo)/)",
  ],
  moduleNameMapper: {
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo/(.*)$": "<rootDir>/__mocks__/expo.js",
  },
};
