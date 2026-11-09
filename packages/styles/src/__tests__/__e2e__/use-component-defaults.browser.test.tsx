import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
  useComponentDefaults,
} from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { renderWithSalt } from "~browser-test-utils/render";

type WidgetProps = {
  className?: string;
  title?: string;
  tone?: "neutral" | "accented";
  variant?: "primary" | "secondary";
  "data-track"?: string;
};

declare module "@salt-ds/styles" {
  interface ComponentDefaultablePropsMap {
    Widget: Pick<WidgetProps, "tone" | "variant" | "title">;
  }
}

function TestComponent({ props }: { props: WidgetProps }) {
  const { props: mergedProps, rootDataAttributes } = useComponentDefaults(
    "Widget",
    props,
  );

  return (
    <button
      type="button"
      {...(mergedProps as Record<string, unknown>)}
      {...rootDataAttributes}
    />
  );
}

const button = () => {
  const element = document.querySelector("button");
  if (!element) throw new Error("Could not find test button");
  return page.elementLocator(element);
};

describe("Given useComponentDefaults", () => {
  it("SHOULD return original props unchanged when no provider", async () => {
    await renderWithSalt(<TestComponent props={{ title: "Hello" }} />);

    await expect.element(button()).toHaveAttribute("title", "Hello");
    await expect.element(button()).not.toHaveAttribute("tone");
    await expect.element(button()).not.toHaveAttribute("variant");
  });

  it("SHOULD apply defaults when matching props are unset", async () => {
    const registry: ComponentDefaultsRegistry = {
      Widget: {
        props: {
          tone: "neutral",
          variant: "secondary",
          title: "From defaults",
        },
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={registry}>
        <TestComponent props={{ title: "Hello" }} />
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).toHaveAttribute("tone", "neutral");
    await expect.element(button()).toHaveAttribute("variant", "secondary");
    await expect.element(button()).toHaveAttribute("title", "Hello");
  });

  it("SHOULD preserve explicitly supplied props over defaults", async () => {
    const registry: ComponentDefaultsRegistry = {
      Widget: {
        props: {
          tone: "neutral",
          variant: "secondary",
          title: "From defaults",
        },
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={registry}>
        <TestComponent
          props={{ tone: "accented", variant: "primary", title: "Instance" }}
        />
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).toHaveAttribute("tone", "accented");
    await expect.element(button()).toHaveAttribute("variant", "primary");
    await expect.element(button()).toHaveAttribute("title", "Instance");
  });

  it("SHOULD ignore default props when the default value is undefined", async () => {
    const registry: ComponentDefaultsRegistry = {
      Widget: {
        props: {
          tone: undefined,
          variant: "secondary",
        },
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={registry}>
        <TestComponent props={{ title: "Hello" }} />
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).not.toHaveAttribute("tone");
    await expect.element(button()).toHaveAttribute("variant", "secondary");
  });

  it("SHOULD apply root data attributes when missing", async () => {
    const registry: ComponentDefaultsRegistry = {
      Widget: {
        rootDataAttributes: {
          "data-track": "defaults",
        },
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={registry}>
        <TestComponent props={{ title: "Hello" }} />
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).toHaveAttribute("data-track", "defaults");
  });

  it("SHOULD not override explicit data attributes", async () => {
    const registry: ComponentDefaultsRegistry = {
      Widget: {
        rootDataAttributes: {
          "data-track": "defaults",
        },
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={registry}>
        <TestComponent props={{ "data-track": "instance" }} />
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).toHaveAttribute("data-track", "instance");
  });

  it("SHOULD ignore non data-* root attributes at runtime", async () => {
    const registry: ComponentDefaultsRegistry = {
      Widget: {
        rootDataAttributes: {
          "data-track": "defaults",
          // biome-ignore lint/suspicious/noExplicitAny: runtime filtering behavior is intentionally verified
          role: "button",
        } as any,
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={registry}>
        <TestComponent props={{ title: "Hello" }} />
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).toHaveAttribute("data-track", "defaults");
    await expect.element(button()).not.toHaveAttribute("role");
  });

  it("SHOULD use nested provider replacement semantics", async () => {
    const outer: ComponentDefaultsRegistry = {
      Widget: {
        props: { tone: "neutral", variant: "secondary" },
      },
    };

    const inner: ComponentDefaultsRegistry = {
      Widget: {
        props: { tone: "accented" },
      },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={outer}>
        <ComponentDefaultsProvider value={inner}>
          <TestComponent props={{}} />
        </ComponentDefaultsProvider>
      </ComponentDefaultsProvider>,
    );

    await expect.element(button()).toHaveAttribute("tone", "accented");
    await expect.element(button()).not.toHaveAttribute("variant");
  });
});
