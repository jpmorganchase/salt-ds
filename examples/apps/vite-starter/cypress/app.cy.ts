describe("Salt Vite starter", () => {
  beforeEach(() => cy.visit("/"));

  it("supports keyboard controls, form feedback, and an accessible dialog", () => {
    cy.findByRole("heading", { name: "Create a project" }).should("be.visible");
    cy.get('[data-testid="mode-toggle"]').focus().should("have.focus").click();
    cy.get(".appShell").should("have.attr", "data-mode", "dark");
    cy.get('[data-testid="density-toggle"]')
      .focus()
      .should("have.focus")
      .click();
    cy.get(".appShell").should("have.attr", "data-density", "high");

    cy.findByRole("button", { name: "Preview launch" }).click();
    cy.findByRole("dialog").should("be.visible").type("{esc}");
    cy.findByRole("dialog").should("not.exist");

    cy.findByLabelText("Project name").type("Market insights");
    cy.findByLabelText("Owner email").type("owner@example.com");
    cy.findByRole("button", { name: "Save project" }).click();
    cy.findByRole("status").should("contain.text", "saved");
  });

  it("is responsive and has no detectable accessibility violations", () => {
    cy.viewport(600, 800);
    cy.findByRole("navigation", { name: "Primary navigation" }).should("be.visible");
    cy.injectAxe({ axeCorePath: "node_modules/axe-core/axe.min.js" });
    cy.checkA11y();
  });
});
