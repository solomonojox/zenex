/**
 * Jest for the Next.js app.
 *
 * Scoped to pure logic in `lib/` (formatting, parsing, money/time helpers) —
 * the code where a silent bug does real damage. Component rendering tests
 * would need jsdom + Testing Library; that can be layered on later.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/lib"],
  testMatch: ["**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          target: "ES2021",
          esModuleInterop: true,
          skipLibCheck: true,
        },
      },
    ],
  },
};
