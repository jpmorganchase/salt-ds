import { CircularProgress } from "../../../progress";

describe("GIVEN a CircularProgress", () => {
  it("SHOULD render progress circle with correct value and percentage", () => {
    cy.mount(<CircularProgress value={50} />);
    cy.findByRole("progressbar").should("have.attr", "aria-valuemax", "100");
    cy.findByRole("progressbar").should("have.attr", "aria-valuemin", "0");
    cy.findByRole("progressbar").should("have.attr", "aria-valuenow", "50");
  });

  it("SHOULD render progress circle with correct min-max values", () => {
    cy.mount(<CircularProgress min={20} max={40} value={30} />);
    cy.findByRole("progressbar").should("have.attr", "aria-valuemax", "40");
    cy.findByRole("progressbar").should("have.attr", "aria-valuemin", "20");
    cy.findByRole("progressbar").contains("50 %");
  });
});
