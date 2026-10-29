// Run every test in a timezone behind UTC, so date helpers that would show
// "2026-05-01" as 30 April (the bug parseApiDate exists to prevent) fail here.
// Set before Jest starts its workers so they inherit it.
process.env.TZ = "America/Los_Angeles";

/** @type {import("jest").Config} */
module.exports = {
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
    // Babel only strips types and JSX; `npm run typecheck` still does the type checking.
    transform: {
        "^.+\.[jt]sx?$": ["babel-jest", { configFile: "./babel.jest.config.cjs" }]
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "\.css$": "<rootDir>/src/test/styleStub.cjs"
    },
    setupFiles: ["<rootDir>/src/test/setup.ts"]
};
