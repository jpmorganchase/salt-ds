import * as megaMenuStories from "@stories/mega-menu/mega-menu.cypress.stories";
import { composeStories } from "@storybook/react-vite";

const { Interactive, DefaultOpen } = composeStories(megaMenuStories);

describe("Given a MegaMenu", () => {
  it("renders triggers and keeps menu closed initially", () => {
    cy.mount(<Interactive />);

    cy.findByRole("button", { name: "Solutions" }).should("exist");
    cy.findByRole("button", { name: "Services" }).should("exist");
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("opens and closes a menu on trigger click", () => {
    cy.mount(<Interactive />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("switches open state between top-level triggers", () => {
    cy.mount(<Interactive />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("exist");

    cy.findByRole("button", { name: "Services" }).click();
    cy.findByRole("link", { name: "Strategy" }).should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("not.exist");
  });

  it("selects an item and closes the menu", () => {
    cy.mount(<Interactive />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).click();

    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("closes on outside click", () => {
    cy.mount(<Interactive />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.get("body").click(0, 0);
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("opens initially when defaultOpen is true", () => {
    cy.mount(<DefaultOpen />);

    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("exist");
  });

  it("does not persist item active state after selection", () => {
    cy.mount(<Interactive />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).should(
      "not.have.attr",
      "aria-current",
    );
  });
});
