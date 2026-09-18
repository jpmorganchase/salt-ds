describe("Salt Next App Router starter", () => {
  beforeEach(() => cy.visit("/"));

  it("keeps server content and interactive controls usable", () => {
    cy.findByRole("heading", { name: "A production-minded App Router start" }).should("be.visible");
    cy.wait(500);
    cy.get('[data-testid="mode-toggle"]').focus().should("have.focus").click();
    cy.get(".appShell").should("have.attr", "data-mode", "dark");
    cy.findByRole("button", { name: "Request access" }).click();
    cy.findByLabelText("Business reason").type("Support operational review");
    cy.findByRole("button", { name: "Send request" }).click();
    cy.findByRole("status").should("contain.text", "sent");
  });

  it("is responsive and has no detectable accessibility violations", () => {
    cy.viewport(600, 800);
    cy.findByRole("navigation", { name: "Primary navigation" }).should("be.visible");
    cy.injectAxe({ axeCorePath: "node_modules/axe-core/axe.min.js" });
    cy.checkA11y();
  });
});
