module.exports = {
  extends: ["modular-app", "plugin:storybook/recommended"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: ["./tsconfig.json", "./packages/**/tsconfig.json"],
      },
      rules: {
        "react-hooks/exhaustive-deps": [
          "warn",
          {
            additionalHooks:
              "(useIsomorphicLayoutEffect|useLayoutEffectOnce|useLayoutEffectSkipFirst)",
          },
        ],
      },
    },
    {
      files: ["stories/**/*.stories.*"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
  plugins: ["cypress"],
  env: {
    "cypress/globals": true,
  },
};
