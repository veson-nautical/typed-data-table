module.exports = {
    roots: ["test"],
    transform: {
        "\\.(ts|tsx)$": "ts-jest"
    },
    testEnvironment: "node",
    testRegex: "/test/.*\\.(test|spec)\\.(ts|tsx|js)$",
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    collectCoverageFrom: ["src/**/*.ts"],
    globals: {
        "ts-jest": {
            packageJson: "package.json",
            tsconfig: {
                allowJs: true
            }
        }
    }
};
