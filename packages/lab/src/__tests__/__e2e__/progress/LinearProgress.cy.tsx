import { LinearProgress } from "../../../progress";

describe("GIVEN a LinearProgress", () => {
  it("SHOULD render progress bar", () => {
    cy.mount(<LinearProgress />);
    cy.get('[data-testid="linear-progress"]').should("exist");
  });

  it("SHOULD render progress bar with correct value with correct value and percentage", () => {
    cy.mount(<LinearProgress value={50} />);
    cy.get("[aria-valuemax=100]").should("exist");
    cy.get("[aria-valuemin=0]").should("exist");
    cy.get("[aria-valuenow=50]").should("exist");
  });

  it("SHOULD render progress bar with correct min-max values", () => {
    cy.mount(<LinearProgress min={20} max={40} value={30} />);
    cy.get("[aria-valuemax=40]").should("exist");
    cy.get("[aria-valuemin=20]").should("exist");
    cy.get('[data-testid="linear-progress"]').contains("50 %");
  });
});
