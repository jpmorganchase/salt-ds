import * as tabsStories from "@stories/tabs-next/tabs-next.stories";
import { composeStories } from "@storybook/react-vite";

const {
  Bordered,
  DisabledTabs,
  Overflow,
  AddTabs,
  Closable,
  AddWithDialog,
  CloseWithConfirmation,
  WithInteractiveElementInPanel,
  Controlled,
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
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("Home");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
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
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");
  });

  it("should support selection with the keyboard", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Bordered onChange={changeSpy} />);
    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");
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
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

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
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");
  });

  it("should allow keyboard navigation into the overflow menu", () => {
    cy.mount(<Overflow />);

    cy.findAllByRole("tab").should("have.length", 5);

    cy.realPress("Tab");
    cy.findByRole("tab", { name: "Home" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("tab", { name: "13 tabs hidden" }).should("be.focused");

    cy.realPress("Enter");
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");

    cy.realPress("ArrowDown");
    cy.findByRole("tab", { name: "With" }).should("be.focused");

    cy.realPress("Escape");
    cy.findByRole("tab", { name: "13 tabs hidden" }).should("be.focused");
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
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");
  });

  it("should overflow into a menu when there is not enough space to show all tabs", () => {
    cy.mount(<Overflow />);
    cy.findAllByRole("tab").should("have.length", 5);
    cy.findByRole("tab", { name: "13 tabs hidden" }).should("be.visible");
  });

  it("should allow keyboard navigation in the menu", () => {
    cy.mount(
      <>
        <Overflow />
        <button>end</button>
      </>,
    );
    cy.findByRole("tab", { name: "13 tabs hidden" }).realClick();
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("tab", { name: "With" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("tab", { name: "Screens" }).should("be.focused");
    cy.realPress("Escape");
    cy.findByRole("tab", { name: "13 tabs hidden" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should close the overflow menu when a click is detected outside", () => {
    cy.mount(<Overflow />);

    cy.findByRole("tab", { name: "13 tabs hidden" }).realClick();
    cy.findAllByRole("tab").should("have.length", 13);

    cy.wait(500);

    cy.get("body").click(0, 0);
    cy.findAllByRole("tab").should("have.length", 5);
  });

  it("should allow selection in the menu", () => {
    cy.mount(<Overflow />);

    cy.findAllByRole("tab").should("have.length", 5);

    cy.findByRole("tab", { name: "13 tabs hidden" }).realClick();
    cy.findByRole("tab", { name: "Liquidity" }).should("be.focused");

    cy.findByRole("tab", { name: "Liquidity" }).realClick();
    cy.findByRole("tab", { name: "Liquidity" })
      .should("have.attr", "aria-selected", "true")
      .should("be.focused");

    cy.findAllByRole("tab").should("have.length", 5);

    cy.wait(100);

    cy.findByRole("tab", { name: "13 tabs hidden" }).realClick();
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.realPress("Enter");
    cy.findByRole("tab", { name: "Checks" })
      .should("have.attr", "aria-selected", "true")
      .should("be.focused");
  });

  it("should allow selection in the menu when only having enough space for the newly selected tab", () => {
    cy.mount(<Overflow />);

    cy.findByRole("tablist").invoke("css", "max-width", 140);
    cy.wait(500);

    cy.findAllByRole("tab").should("have.length", 2);

    cy.findByRole("tab", { name: "16 tabs hidden" }).realClick();
    cy.findAllByRole("tab").should("have.length", 16); // overflow menu shown
    cy.findByRole("tab", { name: "Liquidity" }).realClick();
    cy.findAllByRole("tab").should("have.length", 2); // overflow menu hidden

    cy.findByRole("tab", { name: "Liquidity" })
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

  it("should add the correct aria when tab actions are used", () => {
    cy.mount(<Closable />);

    // TODO: enable when aria-actions is supported in browsers.
    // cy.findByRole("tab", { name: "Home" })
    //   .invoke("attr", "aria-actions")
    //   .then((actionId) => {
    //     cy.findByRole("button", { name: "Home Close tab" }).should(
    //       "have.attr",
    //       "id",
    //       actionId,
    //     );
    //   });

    cy.findByRole("tab", { name: "Home" }).should(
      "have.accessibleDescription",
      "1 action available",
    );
  });

  it("should support closing tabs with a mouse", () => {
    cy.mount(<Closable />);

    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findAllByRole("tab").should("have.length", 5);

    cy.findByRole("button", { name: "Liquidity Close tab" }).realClick();
    cy.findAllByRole("tab").should("have.length", 4);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.findByRole("button", { name: "Loans Close tab" }).realClick();
    cy.findAllByRole("tab").should("have.length", 3);
    cy.findByRole("tab", { name: "Home" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("tab", { name: "Checks" }).should("be.focused");

    cy.findByRole("button", { name: "Home Close tab" }).realClick();
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
    cy.findByRole("button", { name: "Home Close tab" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Transactions Close tab" }).should(
      "be.focused",
    );

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("tab", { name: "Transactions" }).should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Home Close tab" }).should("be.focused");

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

    cy.findAllByRole("button", { name: "Home Close tab" }).realClick();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("button", { name: "No" }).realClick();
    cy.findByRole("dialog").should("not.to.exist");
    cy.findByRole("button", { name: "Home Close tab" }).should("be.focused");

    cy.findAllByRole("button", { name: "Home Close tab" }).realClick();
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

  it("should set tab-index 0 on the panel when it contains non-tabbable elements", () => {
    cy.mount(<Bordered />);
    cy.findByRole("tabpanel").should("have.attr", "tabIndex", "0");
  });

  it("should not set tab-index 0 on the panel when it contains tabbable elements", () => {
    cy.mount(<WithInteractiveElementInPanel />);
    cy.findByRole("tabpanel").should("not.have.attr", "tabIndex");
  });

  it("should associate panels with tabs", () => {
    cy.mount(<Bordered />);

    cy.findByRole("tabpanel", { name: "Home" }).should("be.visible");
  });

  it("should dynamically overflow tabs", () => {
    cy.mount(<Overflow />);
    cy.findAllByRole("tab").should("have.length", 5);

    cy.findByRole("tablist").invoke("css", "max-width", 500);
    cy.wait(500);
    cy.findAllByRole("tab").should("have.length", 7);

    cy.findByRole("tablist").invoke("css", "max-width", 200);
    cy.wait(500);
    cy.findAllByRole("tab").should("have.length", 3);
  });

  it("should support a controlled API", () => {
    cy.mount(<Controlled />);

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

    cy.findByRole("tab", { name: "15 tabs hidden" }).realClick();
    cy.findByRole("tab", { name: "Loans" }).should("be.focused");

    cy.findByRole("tab", { name: "Lots" }).realClick();
    cy.findByRole("tab", { name: "Lots" }).should("be.focused");
    cy.findByRole("tab", { name: "Lots" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.wait(100);

    cy.findByRole("button", { name: "Lots Close tab" }).realClick();
    cy.findByRole("tab", { name: "Transactions" })
      .should("have.attr", "aria-selected", "true")
      .and("be.focused");
  });

  it(
    "should flip overflow menu placement if there is enough space",
    { viewportWidth: 430 },
    () => {
      cy.get("body").invoke("css", "display", "block");

      cy.mount(<Overflow />);
      cy.findAllByRole("tab").should("have.length", 5);

      cy.findByRole("tab", { name: "13 tabs hidden" }).realClick();
      cy.wait(500);

      // no horizontal overflow, menu should flip in horizontally
      cy.get("html").then((body) => {
        const { clientWidth, scrollWidth } = body[0];
        expect(clientWidth).to.equal(scrollWidth);
      });
    },
  );
});
