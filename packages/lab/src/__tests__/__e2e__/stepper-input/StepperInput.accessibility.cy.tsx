import * as stepperInputStories from "@stories/stepper-input/stepper-input.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(stepperInputStories);
const { Default } = composedStories;

describe("Stepper Input - Accessibility", () => {
  checkAccessibility(composedStories);

  it("sets the correct default ARIA attributes on input", () => {
    cy.mount(
      <Default
        decimalPlaces={2}
        defaultValue={-20.1}
        max={250.23}
        min={-500.11}
      />,
    );

    cy.findByRole("spinbutton").should("have.attr", "aria-valuenow", "-20.1");
    cy.findByRole("spinbutton").should("have.attr", "aria-valuemax", "250.23");
    cy.findByRole("spinbutton").should("have.attr", "aria-valuemin", "-500.11");
    cy.findByRole("spinbutton").should("have.attr", "aria-invalid", "false");
  });

  it("has the correct labelling when wrapped in a `FormField`", () => {
    cy.mount(<Default defaultValue={-10} min={0} />);

    cy.findByRole("spinbutton").should("have.accessibleName", "Stepper Input");
    cy.findByRole("spinbutton").should(
      "have.accessibleDescription",
      "Please enter a number",
    );
  });

  it("sets `aria-invalid=false` on input when the value is out of range", () => {
    cy.mount(<Default defaultValue={-10} min={0} />);
    cy.findByRole("spinbutton").should("have.attr", "aria-invalid", "true");
  });

  it("sets the correct default ARIA attributes on the increment/decrement buttons", () => {
    cy.mount(<Default />);
    cy.findByLabelText("increment value")
      .should("have.attr", "tabindex", "-1")
      .and("have.attr", "aria-hidden", "true");

    cy.findByLabelText("decrement value")
      .should("have.attr", "tabindex", "-1")
      .and("have.attr", "aria-hidden", "true");
  });
});
