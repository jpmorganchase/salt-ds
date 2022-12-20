import { ChangeEventHandler } from "react";
import { RadioButton, RadioButtonGroup } from "../../../radio-button";

describe("GIVEN a RadioButtonGroup component", () => {
  describe("WHEN three radio buttons are passed as a prop", () => {
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
          radios={radios}
          value="button one"
        />
      );
      cy.findAllByRole("radio").should("have.length", 3);
    });
  });

  describe("WHEN rendered in horizontal (row) layout", () => {
    it("THEN should have the horizontal class name", () => {
      cy.mount(
        <RadioButtonGroup data-testid="radio-button-group-test" row>
          <RadioButton label="Spot" value="spot" />
          <RadioButton label="Forward" value="forward" />
        </RadioButtonGroup>
      );
      cy.findByTestId("radio-button-group-test").should(
        "have.class",
        "saltFormGroup-row"
      );
    });
  });
});

describe("GIVEN a RadioButtonGroup uncontrolled component with children as function", () => {
  describe("WHEN defaultValue is set", () => {
    it("THEN it should render with the specified radio being checked", () => {
      cy.mount(
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          legend="Uncontrolled Group"
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
});
