import lightTheme from "prism-react-renderer/themes/github/index.cjs.js";

export default {
  ...lightTheme,
  styles: [
    ...lightTheme.styles,
    {
      types: ["font-matter", "string", "attr-value"],
      style: {
        color: "var(--uitk-color-teal-500)",
      },
    },
  ],
};
