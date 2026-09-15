import type { ButtonProps, CardProps } from "@salt-ds/core";
import {
  ClassNameInjectionProvider,
  type ClassNameInjectionRegistry,
  registerClassInjector,
  useClassNameInjection,
} from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { renderWithSalt } from "~browser-test-utils/render";

declare module "@salt-ds/styles" {
  interface ComponentPropsMap {
    Button: ButtonProps;
    Card: CardProps;
    Widget: { className: string; size: string; title: string };
  }
}

// biome-ignore lint/suspicious/noExplicitAny: mirrors arbitrary component props accepted by the hook
function TestComponent<T extends { className?: string } & Record<string, any>>({
  componentName,
  props,
}: {
  componentName: "Button" | "Card" | "Widget";
  props: T;
}) {
  const { className, props: cleanProps } = useClassNameInjection(
    componentName,
    props,
  );
  return <button type="button" className={className} {...cleanProps} />;
}

const button = () => {
  const element = document.querySelector("button");
  if (!element) throw new Error("Could not find test button");
  return page.elementLocator(element);
};

describe("Given useClassNameInjection", () => {
  it("SHOULD return original className and props unchanged when no provider", async () => {
    await renderWithSalt(
      <TestComponent
        componentName="Button"
        props={{ className: "base", title: "Hello" }}
      />,
    );
    await expect.element(button()).toHaveAttribute("class", "base");
    await expect.element(button()).toHaveAttribute("title", "Hello");
  });

  it("SHOULD not add a className or remove props when no provider and no original className", async () => {
    await renderWithSalt(
      <TestComponent componentName="Button" props={{ title: "Hello" }} />,
    );
    await expect.element(button()).not.toHaveAttribute("class");
    await expect.element(button()).toHaveAttribute("title", "Hello");
  });

  it("SHOULD return original className and props unchanged when provider but no injectors", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{ className: "base", title: "Hello" }}
        />
      </ClassNameInjectionProvider>,
    );
    await expect.element(button()).toHaveAttribute("class", "base");
    await expect.element(button()).toHaveAttribute("title", "Hello");
  });

  it("SHOULD support additional prop on component", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<
      { className?: string; size?: "sm" | "md" | "lg"; title?: string },
      "size"
    >(registry, "Widget", ["size"], ({ size }) =>
      size ? `size-${size}` : undefined,
    );
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Widget"
          props={{ className: "base", size: "lg", title: "Hello" }}
        />
      </ClassNameInjectionProvider>,
    );
    await expect.element(button()).toHaveAttribute("class", "base size-lg");
    await expect.element(button()).toHaveAttribute("title", "Hello");
    await expect.element(button()).not.toHaveAttribute("size");
  });

  it("SHOULD multiple additional props on component", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    type Props = {
      className?: string;
      size?: "sm" | "md" | "lg";
      variant?: "primary" | "secondary";
      title?: string;
    };
    registerClassInjector<Props, "size">(
      registry,
      "Button",
      ["size"],
      ({ size }) => (size ? `size-${size}` : undefined),
    );
    registerClassInjector<Props, "variant">(
      registry,
      "Button",
      ["variant"],
      ({ variant }) => (variant ? `variant-${variant}` : undefined),
    );
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{
            className: "base",
            size: "md",
            variant: "primary",
            title: "Hi",
          }}
        />
      </ClassNameInjectionProvider>,
    );
    await expect
      .element(button())
      .toHaveAttribute("class", "base size-md variant-primary");
    await expect.element(button()).toHaveAttribute("title", "Hi");
    await expect.element(button()).not.toHaveAttribute("size");
    await expect.element(button()).not.toHaveAttribute("variant");
  });

  it("SHOULD not add a class and SHOULD leave the key intact when the injector returns undefined", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<{ foo?: string }, "foo">(
      registry,
      "Widget",
      ["foo"],
      ({ foo }) => (foo === "add" ? "extra" : undefined),
    );
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Widget"
          props={{ className: "base", foo: "skip" }}
        />
      </ClassNameInjectionProvider>,
    );

    // injector opted out (returned undefined), so no class is added and the
    // prop passes through to the component untouched
    await expect.element(button()).toHaveAttribute("class", "base");
    await expect.element(button()).toHaveAttribute("foo", "skip");
  });

  it("SHOULD not add a class but SHOULD delete the key when the injector returns an empty string", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<{ foo?: string }, "foo">(
      registry,
      "Widget",
      ["foo"],
      () => "",
    );
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Widget"
          props={{ className: "base", foo: "skip" }}
        />
      </ClassNameInjectionProvider>,
    );
    await expect.element(button()).toHaveAttribute("class", "base");
    await expect.element(button()).not.toHaveAttribute("foo");
  });

  it("SHOULD leave every injector key intact when a multi-key injector opts out", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<
      { className?: string; appearance?: string; sentiment?: string },
      "appearance" | "sentiment"
    >(
      registry,
      "Button",
      ["appearance", "sentiment"],
      ({ appearance, sentiment }) =>
        appearance === "special" && sentiment
          ? `special-${sentiment}`
          : undefined,
    );

    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{
            className: "base",
            appearance: "solid",
            sentiment: "accented",
          }}
        />
      </ClassNameInjectionProvider>,
    );

    await expect.element(button()).toHaveAttribute("class", "base");
    await expect.element(button()).toHaveAttribute("appearance", "solid");
    await expect.element(button()).toHaveAttribute("sentiment", "accented");
  });

  it("SHOULD strip every injector key when a multi-key injector acts", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<
      { className?: string; appearance?: string; sentiment?: string },
      "appearance" | "sentiment"
    >(
      registry,
      "Button",
      ["appearance", "sentiment"],
      ({ appearance, sentiment }) =>
        appearance === "special" && sentiment
          ? `special-${sentiment}`
          : undefined,
    );

    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{
            className: "base",
            appearance: "special",
            sentiment: "accented",
          }}
        />
      </ClassNameInjectionProvider>,
    );

    // injector acted, so its keys are consumed and stripped from the component
    await expect
      .element(button())
      .toHaveAttribute("class", "base special-accented");
    await expect.element(button()).not.toHaveAttribute("appearance");
    await expect.element(button()).not.toHaveAttribute("sentiment");
  });

  it("SHOULD only update matching components from the registry", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<{ role?: string }, "role">(
      registry,
      "Card",
      ["role"],
      ({ role }) => (role ? `role-${role}` : undefined),
    );
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{ className: "base", role: "figure" }}
        />
      </ClassNameInjectionProvider>,
    );
    await expect.element(button()).toHaveAttribute("class", "base");
    await expect.element(button()).toHaveAttribute("role", "figure");
  });

  it("SHOULD not add an updated className when original className is not provided and registry has no matches", async () => {
    const registry: ClassNameInjectionRegistry = new Map();
    await renderWithSalt(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent componentName="Button" props={{ title: "Hello" }} />
      </ClassNameInjectionProvider>,
    );
    await expect.element(button()).not.toHaveAttribute("class");
  });
});
