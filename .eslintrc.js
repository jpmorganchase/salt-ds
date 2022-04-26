module.exports = {
  extends: ["modular-app"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "react-hooks/exhaustive-deps": [
          "warn",
          {
            additionalHooks: "(useIsomorphicLayoutEffect)",
          },
        ],
      },
    },
  ],
};
