import * as tabsStories from "@stories/tabs-next/tabs-next.stories";
import { composeStories } from "@storybook/react";

const { Main, DisabledTabs, Overflow } = composeStories(tabsStories);

describe("Given a Tabstrip", () => {
  it("should render with tablist and tab roles", () => {
    cy.mount(<Main />);
    cy.findByRole("tablist").should("be.visible");
    cy.findAllByRole("tab").should("have.length", 5);
  });

  it("should support keyboard navigation and wrap", () => {
    cy.mount(<Main />);
    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("have.focus");
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("have.focus");
    cy.realPress("End");
    cy.findByRole("tab", { name: "Liquidity" }).should("have.focus");
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Home" }).should("have.focus");
    cy.realPress("ArrowLeft");
    cy.findByRole("tab", { name: "Liquidity" }).should("have.focus");
    cy.realPress("Home");
    cy.findByRole("tab", { name: "Home" }).should("have.focus");
  });

  it("should support selection with a mouse", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Main onChange={changeSpy} />);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).realClick();
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Transactions",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("have.focus");
  });

  it("should support selection with the keyboard", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Main onChange={changeSpy} />);
    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("have.focus");
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.realPress("ArrowRight");
    cy.realPress("Enter");
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Transactions",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("have.focus");

    cy.realPress("ArrowRight");
    cy.realPress("Space");
    cy.findByRole("tab", { name: "Loans" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("@changeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      "Loans",
    );
    cy.findByRole("tab", { name: "Loans" }).should("have.focus");
  });

  it("should allow tabs to be disabled", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<DisabledTabs onChange={changeSpy} />);
    cy.findByRole("tab", { name: "Loans" }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
    cy.findByRole("tab", { name: "Loans" }).realClick();
    cy.findByRole("tab", { name: "Loans" }).should(
      "have.attr",
      "aria-selected",
      "false",
    );
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByRole("tab", { name: "Loans" }).should("have.focus");
  });

  it("should overflow into a menu when there is not enough space to show all tabs", () => {
    cy.mount(<Overflow />);
    cy.findAllByRole("tab").should("have.length", 17);
    cy.findAllByRole("tab").filter(":visible").should("have.length", 3);
    cy.findAllByRole("tab").filter(":not(:visible)").should("have.length", 14);
    cy.get("[data-overflowbutton]").should("be.visible");
  });

  it("should allow keyboard navigation in the menu", () => {
    cy.mount(<Overflow />);
    cy.get("[data-overflowbutton]").realClick();
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("tab", { name: "Screens" }).should("be.focused");
    cy.realPress("Escape");
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");
  });

  it("should allow selection in the menu", () => {
    cy.mount(<Overflow />);
    cy.get("[data-overflowbutton]").realClick();
    cy.findByRole("tab", { name: "Liquidity" }).realClick();
    cy.findByRole("tab", { name: "Liquidity" })
      .should("have.attr", "aria-selected", "true")
      .should("be.focused");
    cy.get("[data-overflowbutton]").realClick();
    cy.realPress("Enter");
    cy.findByRole("tab", { name: "Checks" })
      .should("have.attr", "aria-selected", "true")
      .should("be.focused");
  });
});
