import { Step, Stepper } from "@salt-ds/core";

describe("<Stepper />", () => {
  it("should expand/collapse when trigger is clicked (depth 1)", () => {
    cy.mount(
      <Stepper orientation="vertical">
        <Step label="Step 1">
          <Step label="Step 1.1" />
          <Step label="Step 1.2" />
          <Step label="Step 1.3" />
        </Step>
      </Stepper>,
    );

    cy.findByText("Step 1").should("be.visible");
    cy.findByText("Step 1.1").should("not.be.visible");

    cy.findByRole("button", { expanded: false }).click();

    cy.findByText("Step 1").should("be.visible");
    cy.findByText("Step 1.1").should("be.visible");
  });

  it("should expand/collapse when trigger is clicked (depth 2)", () => {
    cy.mount(
      <Stepper orientation="vertical">
        <Step label="Step 1">
          <Step label="Step 1.1">
            <Step label="Step 1.1.1" />
            <Step label="Step 1.1.2" />
            <Step label="Step 1.1.3" />
          </Step>
          <Step label="Step 1.2" />
          <Step label="Step 1.3" />
        </Step>
      </Stepper>,
    );

    cy.findByText("Step 1").should("be.visible");
    cy.findByText("Step 1.1").should("not.be.visible");
    cy.findByText("Step 1.1.1").should("not.be.visible");

    cy.findByRole("button", { expanded: false }).click();

    cy.findByText("Step 1").should("be.visible");
    cy.findByText("Step 1.1").should("be.visible");
    cy.findByText("Step 1.1.1").should("not.be.visible");

    cy.findByRole("button", { expanded: false }).click();

    cy.findByText("Step 1").should("be.visible");
    cy.findByText("Step 1.1").should("be.visible");
    cy.findByText("Step 1.1.1").should("be.visible");
  });
});
