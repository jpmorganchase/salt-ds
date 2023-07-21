import { LinearProgress } from "../../../progress";

describe("GIVEN a LinearProgress", () => {
  beforeEach(() => {
    cy.mount(<LinearProgress value={50} />);
  });

  it("SHOULD render progress bar", () => {
    cy.get('[data-testid="linear-progress"]').should("exist");
  });

  it("SHOULD render progress bar with correct value", () => {
    cy.get("[aria-valuenow=50]").should("exist");
  });

  it("SHOULD render progress bar with correct max value", () => {
    cy.get("[aria-valuemax=100]").should("exist");
  });

  it("SHOULD show unit as %", () => {
    cy.contains("%").should("exist");
  });
});
