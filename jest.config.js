module.exports = {
  verbose: true,
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  modulePathIgnorePatterns: ["build"],
  testPathIgnorePatterns: ["/node_modules/"],
  cacheDirectory: "./.jest-cache"
};
