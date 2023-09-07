module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "./tsconfig.json",
      "./packages/**/tsconfig.json",
      "./site/tsconfig.json",
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["@typescript-eslint", "eslint-plugin-local-rules"],
  extends: [
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "airbnb-typescript",
    "prettier",
    "plugin:storybook/recommended",
  ],
  rules: {
    "import/no-extraneous-dependencies": "off",
  },
  overrides: [
    {
      files: ["packages/**/src/**/*.ts", "packages/**/src/**/*.tsx"],
      rules: {
        "local-rules/must-inject-css": 2,
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./packages/**/tsconfig.json",
          "./site/tsconfig.json",
        ],
      },
      rules: {
        "react-hooks/exhaustive-deps": [
          "warn",
          {
            additionalHooks:
              "(useIsomorphicLayoutEffect|useLayoutEffectOnce|useLayoutEffectSkipFirst)",
          },
        ],
        "@typescript-eslint/explicit-module-boundary-types": 0,
      },
    },
    {
      files: ["*.stories.*"],
      rules: {
        "react/prop-types": "off",
      },
    },
    {
      files: ["*.cy.tsx"],
      plugins: ["cypress"],
    },
  ],
};
