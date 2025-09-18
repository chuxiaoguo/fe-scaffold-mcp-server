module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "vue"],
  transform: {
    "^.+\\.vue$": "vue-jest",
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.js",
    "<rootDir>/tests/**/*.js",
    "<rootDir>/src/**/?(*.)(spec|test).js",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!src/main.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text", "lcov"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
