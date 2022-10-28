import { Pill } from "@jpmorganchase/uitk-core";

/**
 * Changes applied to the tests after copy over
 *
 * - All snapshot tests are skipped
 * - Change event handler param order is changed to accommodate new API
 * - Update checkbox class name to match new one
 */

describe("GIVEN a Pill", () => {
  it("THEN should call onChange when clicked", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Pill label="Pill text" onChange={changeSpy} variant="selectable" />
    );
    cy.findByRole("checkbox").click();
    cy.get("@changeSpy").should(
      "have.been.calledOnceWith",
      Cypress.sinon.match.any,
      true
    );
  });

  it("THEN should call onChange when clicked with input as false when already checked", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <Pill
        defaultChecked
        label="Pill text"
        onChange={changeSpy}
        variant="selectable"
      />
    );
    cy.findByRole("checkbox").click();
    cy.get("@changeSpy").should(
      "have.been.calledOnceWith",
      Cypress.sinon.match.any,
      false
    );
  });

  it("THEN should have aria-checked = false initially", () => {
    cy.mount(<Pill label="Pill text" variant="selectable" />);
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "false");
  });

  it("THEN should have aria-checked = true when clicked", () => {
    cy.mount(<Pill label="Pill text" variant="selectable" />);
    cy.findByRole("checkbox")
      .click()
      .should("have.attr", "aria-checked", "true");
  });

  // TODO revisit when looking at visual regression
  it("THEN should show a checked checkbox when clicked", () => {
    cy.mount(<Pill label="Pill text" variant="selectable" />);
    cy.findByRole("checkbox").click();

    cy.get(".uitkPill-checkbox.uitkCheckboxIcon-checked").should("exist");
  });

  it("THEN is checked when defaultChecked is true", () => {
    cy.mount(<Pill defaultChecked label="Pill text" variant="selectable" />);
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "true");
  });

  it("THEN is checked when checked is true", () => {
    cy.mount(<Pill checked label="Pill text" variant="selectable" />);
    cy.findByRole("checkbox").should("have.attr", "aria-checked", "true");
  });
});
