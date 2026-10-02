import {
  Display1,
  Display2,
  Display3,
  Display4,
  Editorial1,
  Editorial2,
  Editorial3,
  Editorial4,
  Eyebrow,
  H1,
  H2,
  H3,
  H4,
  Label,
  Text,
  TextAction,
  TextNotation,
} from "@salt-ds/core";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";
import { renderWithSalt } from "~browser-test-utils/render";

const textExample = "Far away behind the word mountains lives sample text.";

const components = [
  { component: Text, name: "Text", tag: "div" },
  { component: Display1, name: "Display1", tag: "span" },
  { component: Display2, name: "Display2", tag: "span" },
  { component: Display3, name: "Display3", tag: "span" },
  { component: Display4, name: "Display4", tag: "span" },
  { component: Editorial1, name: "Editorial1", tag: "span" },
  { component: Editorial2, name: "Editorial2", tag: "span" },
  { component: Editorial3, name: "Editorial3", tag: "span" },
  { component: Editorial4, name: "Editorial4", tag: "span" },
  { component: Eyebrow, name: "Eyebrow", tag: "span" },
  { component: H1, name: "H1", tag: "h1" },
  { component: H2, name: "H2", tag: "h2" },
  { component: H3, name: "H3", tag: "h3" },
  { component: H4, name: "H4", tag: "h4" },
  { component: Label, name: "Label", tag: "label" },
  { component: TextNotation, name: "TextNotation", tag: "span" },
  { component: TextAction, name: "TextAction", tag: "span" },
] as const;

describe("GIVEN a Text component", () => {
  it.each(components)(
    "$name uses its default element",
    async ({ component: Component, tag }) => {
      const { container } = await renderWithSalt(
        <Component>{textExample}</Component>,
      );
      expect(container.querySelector(tag)).toHaveClass("saltText");
    },
  );

  it.each(components)(
    "$name accepts a custom class",
    async ({ component: Component, tag }) => {
      const { container } = await renderWithSalt(
        <Component className="customClass">{textExample}</Component>,
      );
      expect(container.querySelector(tag)).toHaveClass(
        "saltText",
        "customClass",
      );
    },
  );

  it.each(components)(
    "$name supports rendering as a paragraph",
    async ({ component: Component }) => {
      const { container } = await renderWithSalt(
        <Component as="p">{textExample}</Component>,
      );
      expect(container.querySelector("p")).toHaveClass("saltText");
    },
  );

  it.each(components)(
    "$name supports two-row truncation",
    async ({ component: Component }) => {
      const { container } = await renderWithSalt(
        <Component maxRows={2}>{textExample}</Component>,
      );
      const text = container.querySelector<HTMLElement>(
        ".saltText",
      ) as HTMLElement;
      expect(text).toHaveClass("saltText-lineClamp");
      expect(getComputedStyle(text).webkitLineClamp).toBe("2");
    },
  );

  for (const variant of ["primary", "secondary"] as const) {
    it.each(components)(
      `$name supports the ${variant} variant`,
      async ({ component: Component }) => {
        const { container } = await renderWithSalt(
          <Component variant={variant}>{textExample}</Component>,
        );
        expect(container.querySelector(".saltText")).toHaveClass(
          `saltText-${variant}`,
        );
      },
    );
  }

  for (const color of [
    "primary",
    "secondary",
    "error",
    "warning",
    "success",
    "info",
  ] as const) {
    it.each(components)(
      `$name supports the ${color} color`,
      async ({ component: Component }) => {
        const { container } = await renderWithSalt(
          <Component color={color}>{textExample}</Component>,
        );
        expect(container.querySelector(".saltText")).toHaveClass(
          `saltText-${color}`,
        );
      },
    );
  }

  it("does not add an inherit color class", async () => {
    const { container } = await renderWithSalt(
      <Text color="inherit">{textExample}</Text>,
    );
    expect(container.querySelector(".saltText")).not.toHaveClass(
      "saltText-inherit",
    );
  });
});

const styleGroups = [
  {
    styleAs: "h1",
    components: [Text, H2, H3, H4, Label, TextNotation],
    fontSize: "24px",
  },
  {
    styleAs: "h2",
    components: [Text, H1, H3, H4, Label, TextNotation],
    fontSize: "18px",
  },
  {
    styleAs: "h3",
    components: [Text, H1, H2, H4, Label, TextNotation],
    fontSize: "14px",
  },
  {
    styleAs: "h4",
    components: [Text, H1, H2, H3, Label, TextNotation],
    fontSize: "12px",
  },
  {
    styleAs: "label",
    components: [Text, H1, H2, H3, H4, TextNotation],
    fontSize: "11px",
  },
  {
    styleAs: "notation",
    components: [Text, H1, H2, H3, H4, Label],
    fontSize: "10px",
  },
  {
    styleAs: "display1",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "54px",
  },
  {
    styleAs: "display2",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "36px",
  },
  {
    styleAs: "display3",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "24px",
  },
  {
    styleAs: "editorial1",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "144px",
  },
  {
    styleAs: "editorial2",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "122px",
  },
  {
    styleAs: "editorial3",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "102px",
  },
  {
    styleAs: "editorial4",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "84px",
  },
  {
    styleAs: "eyebrow",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "14px",
  },
  {
    styleAs: "bodyLarge",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "14px",
  },
  {
    styleAs: "labelLarge",
    components: [Text, H1, H2, H3, H4, Label, TextNotation],
    fontSize: "12px",
  },
] as const;

for (const { styleAs, components: styledComponents, fontSize } of styleGroups) {
  describe(`GIVEN styleAs=${styleAs}`, () => {
    for (const [index, Component] of styledComponents.entries()) {
      it(`styles component ${index + 1} as ${styleAs}`, async () => {
        const { container } = await renderWithSalt(
          <Component styleAs={styleAs}>{textExample}</Component>,
        );
        const text = container.querySelector<HTMLElement>(
          ".saltText",
        ) as HTMLElement;
        expect(text).toHaveClass(`saltText-${styleAs}`);
        expect(getComputedStyle(text).fontSize).toBe(fontSize);
      });
    }
  });
}

describe("GIVEN styleAs=action", () => {
  for (const [index, Component] of [
    Text,
    H1,
    H2,
    H3,
    H4,
    Label,
    TextNotation,
  ].entries()) {
    it(`styles component ${index + 1} as an action`, async () => {
      const { container } = await renderWithSalt(
        <Component styleAs="action">{textExample}</Component>,
      );
      const text = container.querySelector<HTMLElement>(
        ".saltText",
      ) as HTMLElement;
      const style = getComputedStyle(text);
      expect(text).toHaveClass("saltText-action");
      expect(style.letterSpacing).toBe("0.6px");
      expect(style.textTransform).toBe("uppercase");
      expect(style.textAlign).toBe("center");
      expect(style.fontWeight).toBe("600");
    });
  }
});

describe("GIVEN styleAs=bodyLarge", () => {
  it("uses body emphasis weights when a heading is styled as body large", async () => {
    const { container } = await renderWithSalt(
      <H1 styleAs="bodyLarge">
        Body large <strong>strong</strong>
      </H1>,
    );
    const heading = container.querySelector<HTMLElement>(
      ".saltText",
    ) as HTMLElement;
    const strong = container.querySelector("strong") as HTMLElement;
    expect(getComputedStyle(heading).fontWeight).toBe("400");
    expect(getComputedStyle(strong).fontWeight).toBe("600");
  });
});

const emphasisContent = (label: string) => (
  <>
    {label} <strong>strong</strong> <small>small</small>
  </>
);

const fontTokenCases = [
  {
    name: "editorial",
    baselineName: "display",
    subject: (
      <Editorial1 data-testid="subject">
        {emphasisContent("Editorial")}
      </Editorial1>
    ),
    baselineTokens: {
      "--salt-text-display-fontFamily": "Courier",
      "--salt-text-display-fontWeight": "100",
      "--salt-text-display-fontWeight-strong": "100",
      "--salt-text-display-fontStyle": "normal",
      "--salt-text-display-textTransform": "lowercase",
    },
  },
  {
    name: "eyebrow",
    baselineName: "body",
    subject: (
      <Eyebrow data-testid="subject">{emphasisContent("Eyebrow")}</Eyebrow>
    ),
    baselineTokens: {
      "--salt-text-fontFamily": "Courier",
      "--salt-text-fontWeight": "100",
      "--salt-text-fontWeight-strong": "100",
    },
  },
] as const;

it.each(fontTokenCases)(
  "uses the $name tokens instead of the $baselineName tokens",
  async ({ name, subject, baselineTokens }) => {
    const { container } = await renderWithSalt(
      <div
        style={
          {
            ...baselineTokens,
            [`--salt-text-${name}-fontFamily`]: "Lato",
            [`--salt-text-${name}-fontWeight`]: "900",
            [`--salt-text-${name}-fontWeight-strong`]: "800",
            [`--salt-text-${name}-fontStyle`]: "italic",
            [`--salt-text-${name}-textTransform`]: "uppercase",
          } as CSSProperties
        }
      >
        {subject}
      </div>,
    );
    const subjectElement = container.querySelector<HTMLElement>(
      '[data-testid="subject"]',
    ) as HTMLElement;
    const style = getComputedStyle(subjectElement);
    expect(style.fontFamily).toBe("Lato");
    expect(style.fontWeight).toBe("900");
    expect(style.fontStyle).toBe("italic");
    expect(style.textTransform).toBe("uppercase");
    expect(
      getComputedStyle(subjectElement.querySelector("strong") as HTMLElement)
        .fontWeight,
    ).toBe("800");
  },
);

it("inherits a custom font family CSS variable", async () => {
  const { container } = await renderWithSalt(
    <div style={{ "--salt-text-fontFamily": "Lato" } as CSSProperties}>
      <Text>{textExample}</Text>
    </div>,
  );
  const text = container.querySelector<HTMLElement>(".saltText") as HTMLElement;
  expect(text).toHaveClass("saltText");
  expect(getComputedStyle(text).fontFamily).toBe("Lato");
});
