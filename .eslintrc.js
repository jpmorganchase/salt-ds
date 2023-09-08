module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "./tsconfig.json",
      "./packages/*/tsconfig.json",
      "./site/tsconfig.json",
    ],
  },
  plugins: ["@typescript-eslint", "eslint-plugin-local-rules"],
  extends: [
    "plugin:import/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
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
      extends: [
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
      ],
      files: ["*.ts", "*.tsx"],
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
  settings: {
    react: {
      version: "detect",
    },
  },
};
