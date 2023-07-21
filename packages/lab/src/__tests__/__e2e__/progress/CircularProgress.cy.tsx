import { CircularProgress } from "../../../progress";

describe("GIVEN a CircularProgress", () => {
  beforeEach(() => {
    cy.mount(<CircularProgress value={50} />);
  });

  it("SHOULD render progress circle", () => {
    cy.get('[data-testid="circular-progress"]').should("exist");
  });

  it("SHOULD render progress circle with correct value", () => {
    cy.get("[aria-valuenow=50]").should("exist");
  });

  it("SHOULD render progress circle with correct max value", () => {
    cy.get("[aria-valuemax=100]").should("exist");
  });

  it("SHOULD show unit as %", () => {
    cy.contains("%").should("exist");
  });
});
