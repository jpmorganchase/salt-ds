import { expect, it } from "vitest";
import { componentCheckData } from "../checkdata.mjs";

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
