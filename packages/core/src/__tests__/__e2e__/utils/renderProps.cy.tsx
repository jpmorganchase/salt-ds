import { renderProps } from "@salt-ds/core";
import type { ComponentPropsWithoutRef } from "react";

describe("renderProps function", () => {
  const Button = (props: ComponentPropsWithoutRef<"button">) => (
    <button {...props} />
  );

  it("should merge the props and render the JSX element when `render` is a valid React element", () => {
    cy.mount(
      renderProps(Button, {
        render: <Button>Button Children</Button>,
        className: "test-class",
      }),
    );

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

    cy.mount(
      renderProps(Button, {
        render: renderFunction,
        className: "test-class",
      }),
    );

    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });

  it("should render the Type component with the rest of the props when `render` is not provided", () => {
    cy.mount(
      renderProps("button", {
        className: "test-class",
        children: "Button Children",
      }),
    );

    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });

  it("should throw if render and type are not provided", () => {
    expect(() =>
      cy.mount(
        renderProps(null, {
          className: "test-class",
          children: "Button Children",
        }),
      ),
    ).to.throw("Type or render should be provided");
  });

  it("should render the JSX element when `render` is a valid React element and default type is null", () => {
    cy.mount(
      renderProps(null, {
        render: <Button>Button Children</Button>,
        className: "test-class",
      }),
    );

    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });

  it("should call the function with the rest of the props and render the returned element when `render` is a function and default type is null", () => {
    const renderFunction = (props: { className: string }) => (
      <Button className={props.className}>Button Children</Button>
    );

    cy.mount(
      renderProps(null, {
        render: renderFunction,
        className: "test-class",
      }),
    );

    cy.findByRole("button", { name: "Button Children" }).should("exist");
    cy.findByRole("button", { name: "Button Children" }).should(
      "have.class",
      "test-class",
    );
  });
});
