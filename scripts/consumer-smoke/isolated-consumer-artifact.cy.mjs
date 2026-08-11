describe("isolated installed consumer artifact", () => {
  it("renders, handles keyboard activation, and has no Axe violations", () => {
    cy.visit("/");
    cy.findByRole("button", { name: "Save" }).should("be.visible");
    cy.get("body").realClick({ position: "bottomRight" });
    cy.document().its("activeElement").should("match", "body");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Save" }).should("have.focus");
    cy.realPress("Enter");
    cy.findByRole("button", { name: "Saved" }).should(
      "have.attr",
      "data-clicked",
      "true",
    );
    cy.task("readAxeSource", { log: false })
      .then((source) => {
        return cy.window({ log: false }).then((window) => {
          expect(window.document.querySelector("main")).not.to.equal(null);
          window.eval(source);
          return window.axe.run(window.document);
        });
      })
      .then((results) => {
        expect(
          results.violations,
          JSON.stringify(results.violations, null, 2),
        ).to.have.length(0);
      });
  });
});
