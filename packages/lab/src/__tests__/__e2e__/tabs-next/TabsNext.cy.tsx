import * as tabsStories from "@stories/tabs-next/tabs-next.stories";
import { composeStories } from "@storybook/react";

const {
  Bordered,
  DisabledTabs,
  Overflow,
  AddTabs,
  Closable,
  AddWithDialog,
  CloseWithConfirmation,
} = composeStories(tabsStories);

describe("Given a Tabstrip", () => {
  it("should render with tablist and tab roles", () => {
    cy.mount(<Bordered />);
    cy.findByRole("tablist").should("be.visible");
    cy.findAllByRole("tab").should("have.length", 5);
  });

  it("should support keyboard navigation and wrap", () => {
    cy.mount(<Bordered />);
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
    cy.mount(<Bordered onChange={changeSpy} />);
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
    cy.mount(<Bordered onChange={changeSpy} />);
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
    cy.findAllByRole("tab").filter(":visible").should("have.length", 4);
    cy.findAllByRole("tab").filter(":not(:visible)").should("have.length", 13);
    cy.get("[data-overflowbutton]").should("be.visible");
  });

  it("should allow keyboard navigation in the menu", () => {
    cy.mount(<Overflow />);
    cy.get("[data-overflowbutton]").realClick();
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("tab", { name: "Reports" }).should("be.focused");
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

  it("should support adding tabs", () => {
    cy.mount(<AddTabs />);
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Add tab" }).realClick();
    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "New tab" }).should("be.visible");
    cy.findByRole("button", { name: "Add tab" }).should("be.focused");
  });

  it("should support adding tabs with confirmation", () => {
    cy.mount(<AddWithDialog />);
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Add tab" }).realClick();

    cy.findByRole("dialog").should("be.visible");
    cy.findByLabelText("New tab name").realClick();
    cy.realType("New tab");
    cy.findByRole("button", { name: "Confirm" }).realClick();

    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "New tab" }).should("be.visible");
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Add tab" }).should("be.focused");
  });

  it("should support closing tabs with a mouse", () => {
    cy.mount(<Closable />);

    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findAllByRole("tab").should("have.length", 5);

    cy.findByRole("button", { name: "Close tab Liquidity" }).realClick();
    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.findByRole("button", { name: "Close tab Loans" }).realClick();
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.findByRole("button", { name: "Close tab Home" }).realClick();
    cy.findAllByRole("tab").should("have.length", 2);
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should support closing with a keyboard", () => {
    cy.mount(<Closable />);
    cy.findAllByRole("tab").should("have.length", 5);

    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Close tab Home" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Close tab Transactions" }).should(
      "be.focused",
    );

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Close tab Home" }).should("be.focused");

    cy.realPress("Enter");

    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should support closing with confirmation", () => {
    cy.mount(<CloseWithConfirmation />);
    cy.findAllByRole("tab").should("have.length", 3);

    cy.findAllByRole("button", { name: "Close tab Home" }).realClick();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("button", { name: "No" }).realClick();
    cy.findByRole("dialog").should("not.to.exist");
    cy.findByRole("button", { name: "Close tab Home" }).should("be.focused");

    cy.findAllByRole("button", { name: "Close tab Home" }).realClick();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("button", { name: "Yes" }).realClick();
    cy.findByRole("dialog").should("not.to.exist");
    cy.findAllByRole("tab").should("have.length", 2);
    cy.findByRole("tab", { name: "Transactions" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });
});
