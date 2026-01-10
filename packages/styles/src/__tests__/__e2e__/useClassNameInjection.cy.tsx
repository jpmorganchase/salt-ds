import type { ButtonProps, CardProps } from "@salt-ds/core";
import {
  ClassNameInjectionProvider,
  type ClassNameInjectionRegistry,
  registerClassInjector,
  useClassNameInjection,
} from "@salt-ds/styles";

declare module "@salt-ds/styles" {
  interface ComponentPropsMap {
    Button: ButtonProps;
    Card: CardProps;
    Widget: { className: string; size: string; title: string };
  }
}

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
  return <button className={className} {...cleanProps} />;
}

describe("Given useClassNameInjection", () => {
  it("SHOULD return original className and props unchanged when no provider", () => {
    cy.mount(
      <TestComponent
        componentName="Button"
        props={{ className: "base", title: "Hello" }}
      />,
    );
    // assert unchanged className and props
    cy.get("button").should("have.attr", "class", "base");
    cy.get("button").should("have.attr", "title", "Hello");
  });

  it("SHOULD not add a className or remove props when no provider and no original className", () => {
    cy.mount(
      <TestComponent componentName="Button" props={{ title: "Hello" }} />,
    );
    // assert component remains unchanged
    cy.get("button").should("not.have.attr", "class");
    cy.get("button").should("have.attr", "title", "Hello");
  });

  it("SHOULD return original className and props unchanged when provider but no injectors", () => {
    const registry: ClassNameInjectionRegistry = new Map();
    cy.mount(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{ className: "base", title: "Hello" }}
        />
      </ClassNameInjectionProvider>,
    );
    // assert unchanged className and props
    cy.get("button").should("have.attr", "class", "base");
    cy.get("button").should("have.attr", "title", "Hello");
  });

  it("SHOULD support additional prop on component", () => {
    const registry: ClassNameInjectionRegistry = new Map();

    registerClassInjector<
      {
        className?: string;
        size?: "sm" | "md" | "lg";
        title?: string;
      },
      "size",
      "Widget"
    >(registry, "Widget", ["size"], ({ size }) =>
      size ? `size-${size}` : undefined,
    );

    cy.mount(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Widget"
          props={{
            className: "base",
            size: "lg",
            title: "Hello",
          }}
        />
      </ClassNameInjectionProvider>,
    );

    // assert original className and size based className, and that size prop is removed
    cy.get("button").should("have.attr", "class", "base size-lg");
    cy.get("button").should("have.attr", "title", "Hello");
    cy.get("button").should("not.have.attr", "size");
  });

  it("SHOULD multiple additional props on component", () => {
    const registry: ClassNameInjectionRegistry = new Map();

    registerClassInjector<
      {
        className?: string;
        size?: "sm" | "md" | "lg";
        variant?: "primary" | "secondary";
        title?: string;
      },
      "size",
      "Button"
    >(registry, "Button", ["size"], ({ size }) =>
      size ? `size-${size}` : undefined,
    );

    registerClassInjector<
      {
        className?: string;
        size?: "sm" | "md" | "lg";
        variant?: "primary" | "secondary";
        title?: string;
      },
      "variant",
      "Button"
    >(registry, "Button", ["variant"], ({ variant }) =>
      variant ? `variant-${variant}` : undefined,
    );

    cy.mount(
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

    // assert original className and size/variant based classNames, and that size/variant prop is removed
    cy.get("button").should(
      "have.attr",
      "class",
      "base size-md variant-primary",
    );
    cy.get("button").should("have.attr", "title", "Hi");
    cy.get("button").should("not.have.attr", "size");
    cy.get("button").should("not.have.attr", "variant");
  });

  it("SHOULD not add a class; key is still deleted when the injector returns undefined", () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<{ foo?: string }, "foo", "Widget">(
      registry,
      "Widget",
      ["foo"],
      ({ foo }) => (foo === "add" ? "extra" : undefined),
    );

    cy.mount(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Widget"
          props={{ className: "base", foo: "skip" }}
        />
      </ClassNameInjectionProvider>,
    );

    // assert original className and that foo prop is removed
    cy.get("button").should("have.attr", "class", "base");
    cy.get("button").should("not.have.attr", "foo");
  });

  it("SHOULD only update matching components from the registry", () => {
    const registry: ClassNameInjectionRegistry = new Map();
    registerClassInjector<{ role?: string }, "role">(
      registry,
      "Card",
      ["role"],
      ({ role }) => (role ? `role-${role}` : undefined),
    );

    cy.mount(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent
          componentName="Button"
          props={{ className: "base", role: "figure" }}
        />
      </ClassNameInjectionProvider>,
    );

    // assert unchanged className and that no className is added from other components
    cy.get("button").should("have.attr", "class", "base");
    cy.get("button").should("have.attr", "role", "figure");
  });

  it("SHOULD not add an updated className when original className is not provided and registry has no matches", () => {
    const registry: ClassNameInjectionRegistry = new Map();
    cy.mount(
      <ClassNameInjectionProvider value={registry}>
        <TestComponent componentName="Button" props={{ title: "Hello" }} />
      </ClassNameInjectionProvider>,
    );
    // assert component has no className
    cy.get("button").should("not.have.attr", "class");
  });
});
