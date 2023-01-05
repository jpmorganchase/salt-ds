import lightTheme from "prism-react-renderer/themes/github/index.cjs.js";

export default {
  ...lightTheme,
  styles: [
    ...lightTheme.styles,
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "var(--salt-color-gray-200)",
        fontStyle: "italic",
      },
    },
    {
      types: ["font-matter", "string", "attr-value"],
      style: {
        color: "var(--salt-color-teal-600)",
      },
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "variable",
        "constant",
        "property",
        "regex",
        "inserted",
      ],
      style: {
        color: "var(--salt-color-green-600)",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "var(--salt-color-blue-500)",
      },
    },
    {
      types: ["function", "deleted", "tag"],
      style: {
        color: "var(--salt-color-red-600)",
      },
    },
  ],
};
