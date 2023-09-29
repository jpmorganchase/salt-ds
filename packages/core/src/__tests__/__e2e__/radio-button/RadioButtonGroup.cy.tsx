import { ChangeEventHandler } from "react";
import {
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react";
import * as radioButtonStories from "@stories/radio-button/radio-button.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(radioButtonStories);

describe("GIVEN a RadioButtonGroup component", () => {
  checkAccessibility(composedStories);

  describe("WHEN three radio buttons are provided as children", () => {
    const radios = [
      { value: "button one", label: "button one", disabled: false },
      { value: "button two", label: "button two", disabled: false },
      {
        value: "button three",
        label: "button three",
        disabled: false,
      },
    ];

    it("THEN it should render three children", () => {
      cy.mount(
        <RadioButtonGroup
          data-testid="radio-button-group-test"
          value="button one"
        >
          {radios.map((radio) => (
            <RadioButton {...radio} />
          ))}
        </RadioButtonGroup>
      );
      cy.findAllByRole("radio").should("have.length", 3);
    });
  });

  describe("WHEN rendered in horizontal layout", () => {
    it("THEN should have the horizontal class name", () => {
      cy.mount(
        <RadioButtonGroup
          data-testid="radio-button-group-test"
          direction={"horizontal"}
        >
          <RadioButton label="Spot" value="spot" />
          <RadioButton label="Forward" value="forward" />
        </RadioButtonGroup>
      );
      cy.get(".saltRadioButtonGroup-horizontal").should("exist");
      cy.get(".saltRadioButtonGroup-horizontal").should(
        "have.css",
        "flex-direction",
        "row"
      );
    });
  });
});

describe("GIVEN a RadioButtonGroup uncontrolled component with children", () => {
  describe("WHEN defaultValue is set", () => {
    it("THEN it should render with the specified radio being checked", () => {
      cy.mount(
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton
            disabled
            key="option"
            label="Option (disabled)"
            value="option"
          />
        </RadioButtonGroup>
      );
      cy.findByRole("radio", { name: "Forward" }).should("be.checked");
    });
  });

  it("THEN selecting an option should work", () => {
    const changeSpy = cy.stub().as("changeSpy");

    const handleChange: ChangeEventHandler<HTMLInputElement> = (...args) => {
      args[0].persist();
      changeSpy(...args);
    };

    cy.mount(
      <RadioButtonGroup onChange={handleChange}>
        <RadioButton label="Spot" value="spot" />
        <RadioButton label="Forward" value="forward" />
      </RadioButtonGroup>
    );

    cy.findByRole("radio", { name: "Spot" }).should("not.be.checked");
    cy.findByRole("radio", { name: "Forward" }).should("not.be.checked");

    cy.findByRole("radio", { name: "Forward" }).realClick();

    cy.findByRole("radio", { name: "Spot" }).should("not.be.checked");
    cy.findByRole("radio", { name: "Forward" }).should("be.checked");

    cy.get("@changeSpy")
      .should("have.been.calledOnce")
      .and("have.been.calledWithMatch", { target: { value: "forward" } });

    cy.findByRole("radio", { name: "Spot" }).realClick();

    cy.findByRole("radio", { name: "Spot" }).should("be.checked");
    cy.findByRole("radio", { name: "Forward" }).should("not.be.checked");
    cy.get("@changeSpy")
      .should("have.been.calledTwice")
      .and("have.been.calledWithMatch", { target: { value: "spot" } });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      cy.mount(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButtonGroup>
            <RadioButton label="Spot" value="spot" />
            <RadioButton label="Forward" value="forward" />
          </RadioButtonGroup>
        </FormField>
      );

      cy.findAllByRole("radio").eq(0).should("have.attr", "disabled");
      cy.findAllByRole("radio").eq(1).should("have.attr", "disabled");
    });

    it("THEN should respect the context when read-only", () => {
      cy.mount(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButtonGroup>
            <RadioButton label="Spot" value="spot" />
            <RadioButton label="Forward" value="forward" />
          </RadioButtonGroup>
        </FormField>
      );

      cy.findAllByRole("radio").eq(0).should("have.attr", "readonly");
      cy.findAllByRole("radio").eq(1).should("have.attr", "readonly");
    });
  });
});
