import { expect, it } from "vitest";
import { componentCheckData, tokenCheckData } from "../checkdata.mjs";

it("separates current colour-foundation usage restrictions from token lifecycle", () => {
  const data = tokenCheckData({
    tokens: [
      { name: "--salt-spacing-100", tier: "foundations", group: "spacing" },
      {
        name: "--salt-color-blue-500-rgb",
        tier: "foundations",
        group: "color",
        themeOnly: true,
      },
      {
        name: "--salt-color-blue-500",
        tier: "foundations",
        group: "color",
        themeOnly: true,
      },
      {
        name: "--salt-color-blue-500-40a",
        tier: "foundations",
        group: "alpha",
        themeOnly: true,
      },
      { name: "--salt-old", tier: "deprecated" },
    ],
    files: [
      [
        "tokens.md",
        [
          "- `--salt-spacing-100`",
          "- `--salt-color-blue-500-rgb`",
          "- `--salt-color-blue-500`",
          "- `--salt-color-blue-500-40a`",
          "- `--salt-old`",
        ].join("\n"),
      ],
    ],
  });
  expect(data).toEqual({
    pages: ["tokens.md"],
    tokens: {
      "--salt-color-blue-500": ["current", 0],
      "--salt-color-blue-500-40a": ["current", 0],
      "--salt-color-blue-500-rgb": ["current", 0],
      "--salt-old": ["deprecated", 0],
      "--salt-spacing-100": ["current", 0],
    },
    themeOnlyTokens: [
      "--salt-color-blue-500",
      "--salt-color-blue-500-40a",
      "--salt-color-blue-500-rgb",
    ],
  });
});

it("keeps the existing check-data shape when no token has a theme-only restriction", () => {
  expect(
    tokenCheckData({
      tokens: [
        { name: "--salt-spacing-100", tier: "foundations", group: "spacing" },
      ],
      files: [["tokens.md", "- `--salt-spacing-100`"]],
    }),
  ).toEqual({
    pages: ["tokens.md"],
    tokens: { "--salt-spacing-100": ["current", 0] },
  });
});

it("records components' deprecated props, pages and parts, and skips functions", () => {
  const prop = (name, description) => ({ name, description });
  const components = new Map([
    [
      "Button",
      {
        props: {
          variant: prop(
            "variant",
            "Old.\n@deprecated since 1.36.0. Use `appearance`.",
          ),
          appearance: prop("appearance", "The appearance."),
        },
      },
    ],
    // The props parser reads a function's parameter type as its props.
    [
      "useId",
      { props: { substr: prop("substr", "@deprecated A legacy feature.") } },
    ],
    ["Toast", { props: {} }],
  ]);
  expect(
    componentCheckData({
      components,
      pages: new Map([
        ["Button", "components/button.md"],
        ["useId", "x.md"],
      ]),
      requiredParts: { Toast: ["ToastContent"] },
    }),
  ).toEqual({
    components: {
      Button: {
        page: "components/button.md",
        deprecatedProps: { variant: "since 1.36.0. Use `appearance`." },
      },
      Toast: { parts: ["ToastContent"] },
    },
  });
});
