module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@mui/*/*/*"],
            message:
              "Be aware that MUI only support first and second-level imports." +
              " Anything deeper is considered private and can cause issues," +
              " such as module duplication in your bundle.",
          },
        ],
      },
    ],
  },
};
