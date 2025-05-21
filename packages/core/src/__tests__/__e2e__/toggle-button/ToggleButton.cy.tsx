import { ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import * as toggleButtonStories from "@stories/toggle-button/toggle-button.stories";
import { composeStories } from "@storybook/react";

const { Controlled, DefaultSelected } = composeStories(toggleButtonStories);

describe("GIVEN a ToggleButton with Icon and Text", () => {
  it("THEN it should toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");

    cy.mount(<Controlled onChange={selectionChangeSpy} />);

    cy.findByRole("button").should("have.text", "Home");
    cy.findByRole("button").should("have.attr", "aria-pressed", "true");

    // untoggle
    cy.findByRole("button").realClick();
    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.get("@selectionChangeSpy").should("have.been.calledOnce");

    // toggle
    cy.findByRole("button").realClick();
    cy.findByRole("button").should("have.attr", "aria-pressed", "true");
    cy.get("@selectionChangeSpy").should("have.been.calledTwice");
  });
});

describe("GIVEN a disabled ToggleButton with Icon and Text", () => {
  it("THEN it should not toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");

    cy.mount(
      <ToggleButton disabled value="home" onChange={selectionChangeSpy}>
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.findByRole("button").should("have.text", "Home");
    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.findByRole("button").should("be.disabled");

    // try to toggle
    cy.findByRole("button").realClick();
    cy.get("@selectionChangeSpy").should("not.have.been.called");
  });

  it("THEN it should be not be focusable", () => {
    cy.mount(
      <ToggleButton disabled value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.findByRole("button").focus().should("not.have.focus");
    cy.findByRole("button").should("be.disabled");
  });

  it("THEN it should not be focusable when selected and disabled", () => {
    cy.mount(
      <ToggleButton disabled selected value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );
    cy.findByRole("button")
      .should("have.attr", "aria-disabled", "true")
      .and("have.attr", "aria-pressed", "true");
    cy.findByRole("button").focus().should("not.have.focus");
  });
});

describe("GIVEN a read-only ToggleButton", () => {
  it("THEN it should not toggle", () => {
    const selectionChangeSpy = cy.stub().as("selectionChangeSpy");

    cy.mount(
      <ToggleButton readOnly value="home" onChange={selectionChangeSpy}>
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.findByRole("button").should("have.text", "Home");
    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.findByRole("button").should("have.attr", "aria-readonly");

    // try to toggle
    cy.findByRole("button").realClick();
    cy.get("@selectionChangeSpy").should("not.have.been.called");
  });

  it("THEN it should be focusable", () => {
    cy.mount(
      <ToggleButton readOnly value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.realPress("Tab");

    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
    cy.findByRole("button").focus().should("have.focus");
    cy.findByRole("button").should("have.attr", "aria-readonly");
  });

  it("THEN it should be focusable when selected", () => {
    cy.mount(
      <ToggleButton readOnly selected value="home">
        <HomeIcon aria-hidden />
        Home
      </ToggleButton>,
    );

    cy.realPress("Tab");

    cy.findByRole("button").should("have.attr", "aria-pressed", "true");
    cy.findByRole("button").focus().should("have.focus");
    cy.findByRole("button").should("have.attr", "aria-readonly");
  });
});

describe("GIVEN a defaultSelected ToggleButton", () => {
  it("THEN it should be selected by default", () => {
    cy.mount(<DefaultSelected />);
    cy.findByRole("button").should("have.attr", "aria-pressed", "true");
  });
  it("THEN it be controllable by selected prop", () => {
    cy.mount(<DefaultSelected selected={false} />);
    cy.findByRole("button").should("have.attr", "aria-pressed", "false");
  });
});
