import { CircularProgress } from "../../../progress";

describe("GIVEN a CircularProgress", () => {
  it("SHOULD render progress circle", () => {
    cy.mount(<CircularProgress />);
    cy.get('[data-testid="circular-progress"]').should("exist");
  });

  it("SHOULD render progress circle with correct value and percentage", () => {
    cy.mount(<CircularProgress value={50} />);
    cy.get("[aria-valuemax=100]").should("exist");
    cy.get("[aria-valuemin=0]").should("exist");
    cy.get("[aria-valuenow=50]").should("exist");
  });

  it("SHOULD render progress circle with correct min-max values", () => {
    cy.mount(<CircularProgress min={20} max={40} value={30} />);
    cy.get("[aria-valuemax=40]").should("exist");
    cy.get("[aria-valuemin=20]").should("exist");
    cy.get('[data-testid="circular-progress"]').contains("50 %");
  });
});
