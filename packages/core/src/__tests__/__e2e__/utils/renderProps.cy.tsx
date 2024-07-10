import { renderProps } from "@salt-ds/core";
import { mount } from "cypress/react18";
import type { ComponentPropsWithoutRef } from "react";

describe("renderProps function", () => {
  const Button = (props: ComponentPropsWithoutRef<"button">) => (
    <button {...props} />
  );

  it("should merge the props and render the JSX element when `render` is a valid React element", () => {
    const props = {
      render: <Button>Button Children</Button>,
      className: "test-class",
    };

    mount(renderProps(Button, props));
    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });

  it("should call the function with the rest of the props and render the returned element when `render` is a function", () => {
    const renderFunction = (props: { className: string }) => (
      <Button className={props.className}>Button Children</Button>
    );
    const props = {
      render: renderFunction,
      className: "test-class",
    };

    mount(renderProps(Button, props));
    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });

  it("should render the Type component with the rest of the props when `render` is not provided", () => {
    const props = {
      className: "test-class",
      children: "Button Children",
    };

    mount(renderProps("button", props));
    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });
});
