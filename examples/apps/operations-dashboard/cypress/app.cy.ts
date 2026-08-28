describe("Salt operations dashboard", () => {
  beforeEach(() => cy.visit("/"));

  it("filters services and completes the incident workflow by keyboard", () => {
    cy.findByRole("heading", { name: "Operations overview" }).should("be.visible");
    cy.findByLabelText("Filter services").type("risk");
    cy.findByRole("row", { name: /Risk calculator/ }).should("be.visible");
    cy.findByRole("row", { name: /Order gateway/ }).should("not.exist");
    cy.get('[data-testid="density-toggle"]')
      .focus()
      .should("have.focus")
      .click();
    cy.get(".dashboardShell").should("have.attr", "data-density", "high");
    cy.get('[data-testid="mode-toggle"]')
      .focus()
      .should("have.focus")
      .click();
    cy.get(".dashboardShell").should("have.attr", "data-mode", "dark");

    cy.findByRole("button", { name: "Create incident" })
      .focus()
      .should("have.focus")
      .click();
    cy.findByRole("dialog").should("be.visible");
    cy.get("body").type("{esc}");
    cy.findByRole("dialog").should("not.exist");

    cy.findByRole("button", { name: "Create incident" }).click();
    cy.findByLabelText("Incident title").type("Latency regression");
    cy.findByLabelText("Affected service").type("Risk calculator");
    cy.findAllByRole("button", { name: "Create incident" }).last().click();
    cy.findByRole("status").should("contain.text", "responders notified");
  });

  it("is responsive and has no detectable accessibility violations", () => {
    cy.viewport(600, 800);
    cy.findByRole("navigation", { name: "Primary navigation" }).should("be.visible");
    cy.injectAxe({ axeCorePath: "node_modules/axe-core/axe.min.js" });
    cy.checkA11y();
  });
});
