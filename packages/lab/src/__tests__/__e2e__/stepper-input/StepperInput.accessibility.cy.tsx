import { StepperInput, FormField } from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { useState } from "react";

describe("Stepper Input - Accessibility", () => {
  it("sets the correct default ARIA attributes on input", () => {
    cy.mount(
      <StepperInput
        decimalPlaces={2}
        defaultValue={-20.1}
        max={250.23}
        min={-500.11}
      />
    );

    cy.findByRole("spinbutton").should("have.attr", "aria-valuenow", "-20.1");
    cy.findByRole("spinbutton").should("have.attr", "aria-valuemax", "250.23");
    cy.findByRole("spinbutton").should("have.attr", "aria-valuemin", "-500.11");
    cy.findByRole("spinbutton").should("have.attr", "aria-invalid", "false");
  });

  it("has the correct labelling when wrapped in a `FormField`", () => {
    cy.mount(
      <FormField>
        <FormFieldLabel>Stepper Input</FormFieldLabel>
        <StepperInput defaultValue={-10} min={0} />
        <FormFieldHelperText>Please enter a value</FormFieldHelperText>
      </FormField>
    );

    cy.findByRole("spinbutton").should("have.accessibleName", "Stepper Input");
    cy.findByRole("spinbutton").should(
      "have.accessibleDescription",
      "Please enter a value"
    );
  });

  it("appends a message to `aria-label` when the controlled `liveValue` prop changes", () => {
    const ControlledLiveValue = () => {
      const [liveValue, setLiveValue] = useState(10);

      return (
        <>
          <FormField>
            <FormFieldLabel>Stepper Input</FormFieldLabel>
            <StepperInput defaultValue={10} liveValue={liveValue} />
            <FormFieldHelperText>Please enter a value</FormFieldHelperText>
          </FormField>
          <button
            onClick={() => setLiveValue((prev) => prev + 1)}
            type="button"
          >
            Increment
          </button>
        </>
      );
    };

    cy.mount(<ControlledLiveValue />);

    cy.findByRole("spinbutton").should("have.accessibleName", "Stepper Input");
    cy.findByRole("spinbutton").should(
      "have.accessibleDescription",
      "Please enter a value"
    );

    cy.findByRole("button", { name: "Increment" }).realClick();

    cy.findByRole("spinbutton").should(
      "have.accessibleName",
      "Stepper iInput , value out of date"
    );
    cy.findByRole("spinbutton").should(
      "have.accessibleDescription",
      "Please enter a value"
    );
  });

  it("removes the appended message from `aria-label` when the the component is refreshed", () => {
    const ControlledLiveValue = () => {
      const [liveValue, setLiveValue] = useState(11);

      return (
        <>
          <FormField>
            <FormFieldLabel>Stepper Input</FormFieldLabel>
            <StepperInput defaultValue={10} liveValue={liveValue} />
            <FormFieldHelperText>Please enter a value</FormFieldHelperText>
          </FormField>
          <button
            onClick={() => setLiveValue((prev) => prev + 1)}
            type="button"
          >
            Increment
          </button>
        </>
      );
    };

    cy.mount(<ControlledLiveValue />);

    cy.findByRole("button", { name: "Increment" }).realClick();

    cy.findByRole("spinbutton").should(
      "have.accessibleName",
      "Stepper Input , value out of date"
    );
    cy.findByRole("spinbutton").should(
      "have.accessibleDescription",
      "Please enter a value"
    );

    cy.findByRole("button", { name: "Refresh default value" }).realClick();

    cy.findByRole("spinbutton").should("have.accessibleName", "stepper input");
    cy.findByRole("spinbutton").should(
      "have.accessibleDescription",
      "Please enter a value"
    );
  });

  it("sets `aria-invalid=false` on input when the value is out of range", () => {
    cy.mount(<StepperInput defaultValue={-10} min={0} />);
    cy.findByRole("spinbutton").should("have.attr", "aria-invalid", "true");
  });

  it("sets the correct default ARIA attributes on the increment/decrement buttons", () => {
    cy.mount(<StepperInput />);
    cy.findByTestId("increment-button")
      .should("have.attr", "tabindex", "-1")
      .and("have.attr", "aria-hidden", "true");

    cy.findByTestId("decrement-button")
      .should("have.attr", "tabindex", "-1")
      .and("have.attr", "aria-hidden", "true");
  });
});
