module.exports = {
    verbose: true,
    preset: "@shelf/jest-mongodb",
    collectCoverage: true,
    testEnvironment: "node",
    coveragePathIgnorePatterns: [
      "/node_modules/"
    ],
    watchPathIgnorePatterns: ['globalConfig']
};