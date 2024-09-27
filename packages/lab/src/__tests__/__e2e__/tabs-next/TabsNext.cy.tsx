import { StackLayout } from "@salt-ds/core";
import * as tabsStories from "@stories/tabs-next/tabs-next.stories";
import { composeStories } from "@storybook/react";

const { Main, Overflow } = composeStories(tabsStories);

describe("Given a Tabstrip", () => {
  describe("WHEN uncontrolled", () => {
    describe("WHEN a defaultValue is provided", () => {
      it("THEN the defaultValue is selected", () => {
        cy.mount(<Main defaultValue="Transactions" />);
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
      });
    });
  });
  describe("WHEN controlled", () => {
    describe("WHEN value is provided", () => {
      it("THEN the value is selected", () => {
        cy.mount(<Main value="Transactions" />);
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
      });
    });
    describe("WHEN an onChange is provided", () => {
      it("THEN the value is selected", () => {
        cy.mount(
          <Main onChange={cy.spy().as("onChange")} value="Transactions" />,
        );
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");

        cy.findAllByRole("tab").eq(0).realClick();

        cy.get("@onChange").should("have.been.calledOnce");
      });
    });
  });

  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN all the content items will be visible", () => {
        cy.mount(<Main />);
        cy.findByRole("tablist").should("be.visible");
        cy.findAllByRole("tab").should("be.visible");
      });
      it("THEN no overflow indicator will be present", () => {
        cy.mount(<Main />);
        cy.findByRole("tablist")
          .findByRole("tab", { name: /More tabs/ })
          .should("not.exist");
      });
    });

    describe("WHEN resized such that space is sufficient for only 4 tabs (first tab selected)", () => {
      it("THEN first 4 tabs will be displayed, with overflow indicator", () => {
        cy.mount(<Main />);
        cy.get(".saltTabListNext").invoke("css", "width", "350px");
        cy.findAllByRole("tab").should("have.length", 5);
        cy.findAllByRole("tab").filter(":visible").should("have.length", 3);
        cy.findByRole("tab", { name: /More tabs/ })
          .should("exist")
          .realClick();
        cy.findAllByRole("tab").filter(":visible").should("have.length", 5);
      });
    });
  });
  describe("WHEN size is not the full width of it's parent", () => {
    it("THEN should not overflow if it has enough space", () => {
      cy.mount(<Main />);
      cy.findByRole("tab", { name: /More tabs/ }).should("not.exist");
    });
    it("THEN should overflow if it there is not enough space", () => {
      cy.mount(<Overflow />);
      cy.findByRole("tab", { name: /More tabs/ }).should("exist");
    });
  });
});

describe("Tab selection, Given a Tabstrip", () => {
  describe("WHEN initial size is NOT sufficient to display all contents", () => {
    describe("WHEN the selected Tab is in the overflow menu", () => {
      it("THEN the active tab will be moved from the overflow menu to the end of visible tabs", () => {
        cy.mount(<Main />);
        cy.findAllByRole("tab", { name: "Home" }).should(
          "have.attr",
          "aria-selected",
          "true",
        );
        cy.findByRole("tab", { name: /More tabs/ }).realClick();
        cy.findByRole("tab", { name: "Loans" }).realClick();
        cy.findAllByRole("tab", { name: "Loans" }).should("be.visible");
        cy.findAllByRole("tab", { name: "Loans" }).should(
          "have.attr",
          "aria-selected",
          "true",
        );
      });
    });
  });
});

describe("Navigation, Given a Tabstrip", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN the tabstrip is first rendered", () => {
      describe("WHEN the tabstrip receives keyboard focus", () => {
        it("THEN focus will be transferred to the first tab", () => {
          cy.mount(
            <StackLayout>
              <button data-testid="tabstop-1" />
              <Main />
              <button data-testid="tabstop-2" />
            </StackLayout>,
          );
          cy.findByTestId("tabstop-1").focus();
          cy.realPress("Tab");
          cy.findAllByRole("tab").eq(0).should("have.focus");
        });
        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transferred to the next tab", () => {
            cy.mount(
              <StackLayout>
                <button data-testid="tabstop-1" />
                <Main />
                <button data-testid="tabstop-2" />
              </StackLayout>,
            );
            cy.findByTestId("tabstop-1").focus();
            cy.realPress("Tab");
            cy.findAllByRole("tab").eq(0).should("have.focus");
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(1).should("have.focus");
          });
        });
      });

      describe("WHEN the selected tab is clicked", () => {
        it("THEN focus will be transferred to the selected tab", () => {
          cy.mount(
            <StackLayout>
              <button data-testid="tabstop-1" />
              <Main />
              <button data-testid="tabstop-2" />
            </StackLayout>,
          );
          cy.findByTestId("tabstop-1").focus();
          cy.findAllByRole("tab").eq(0).realClick();
          cy.get('[role="tab"]').eq(0).should("be.focused");
        });

        describe("WHEN the left arrow key is pressed (from first tab)", () => {
          it("THEN navigation will wrap", () => {
            cy.mount(<Main />);
            cy.findAllByRole("tab").eq(0).realClick();
            cy.findAllByRole("tab").eq(0).should("be.focused");
            cy.realPress("ArrowLeft");
            cy.findAllByRole("tab").eq(-1).should("be.focused");
          });
        });

        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transferred to the next tab", () => {
            cy.mount(<Main />);
            cy.findAllByRole("tab").eq(0).realClick();
            cy.findAllByRole("tab").eq(0).should("be.focused");
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(1).should("be.focused");
          });
        });

        describe("WHEN the tab key is pressed", () => {
          it("THEN focus will leave the tabstrip", () => {
            cy.mount(
              <StackLayout>
                <button data-testid="tabstop-1" />
                <Main />
                <button data-testid="tabstop-2" />
              </StackLayout>,
            );
            cy.findAllByRole("tab").eq(0).realClick();
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(1).should("be.focused");
            cy.realPress("Tab");
            cy.findByTestId("tabstop-2").should("be.focused");
          });
        });

        describe("WHEN the right arrow key is pressed repeatedly", () => {
          it("THEN focus will be transferred until last tab is reached", () => {
            cy.mount(<Main />);
            cy.findAllByRole("tab").eq(0).realClick();
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(1).should("be.focused");
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(2).should("be.focused");
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(3).should("be.focused");
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(4).should("be.focused");
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(0).should("be.focused");
          });
        });
      });
    });
  });

  describe("WHEN overflow is opened", () => {
    it("THEN overflow menu item can be selected with Enter and focus is moved to the active tab", () => {
      cy.mount(<Overflow />);
      cy.findByRole("tab", { name: /More tabs/ }).realClick();
      cy.realPress("ArrowRight").realPress("Enter");
      cy.focused()
        .should("have.attr", "aria-selected", "true")
        .should("have.attr", "role", "tab");
    });
  });
});
