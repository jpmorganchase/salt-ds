module.exports = {
  extends: ["modular-app", "plugin:storybook/recommended"],
  plugins: ["eslint-plugin-local-rules"],
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
      files: ["stories/**/*.stories.*"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
    {
      files: ["*.cy.tsx"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
};
