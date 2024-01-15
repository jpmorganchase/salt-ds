module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "./tsconfig.json",
      "./cypress/tsconfig.json",
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
    "plugin:import/typescript", // Or Error: Unable to resolve path to module
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
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-unsafe-assignment ": "off",
        "@typescript-eslint/prefer-nullish-coalescing": [
          "error",
          {
            ignorePrimitives: { boolean: true },
          },
        ],
        // TypeScript provides the same checks as part of standard type checking.
        "import/named": "off",
        "import/namespace": "off",
        "import/default": "off",
        "import/no-named-as-default-member": "off",
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
  ignorePatterns: [".eslintrc.js", "**/vite.config.ts"],
};
