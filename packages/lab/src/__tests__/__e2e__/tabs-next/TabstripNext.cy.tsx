import { composeStories } from "@storybook/react";
import * as tabstripStories from "@stories/tabstrip-next/tabstrip-next.stories";
import { StackLayout } from "@salt-ds/core";

const { DefaultLeftAligned: DefaultTabstrip, ControlledTabstrip } =
  composeStories(tabstripStories);

describe("Given a Tabstrip", () => {
  describe("WHEN uncontrolled", () => {
    describe("WHEN a defaultValue is provided", () => {
      it("THEN the defaultValue is selected", () => {
        cy.mount(<DefaultTabstrip defaultValue="Transactions" width={400} />);
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
      });
    });
  });
  describe("WHEN controlled", () => {
    describe("WHEN value is provided", () => {
      it("THEN the value is selected", () => {
        cy.mount(<DefaultTabstrip value="Transactions" width={400} />);
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
      });
    });
    describe("WHEN an onChange is provided", () => {
      it("THEN the value is selected", () => {
        cy.mount(
          <DefaultTabstrip
            onChange={cy.spy().as("onChange")}
            value="Transactions"
            width={400}
          />
        );
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");

        cy.findAllByRole("tab").eq(0).click();

        cy.get("@onChange").should("have.been.calledOnce");
      });
    });
  });

  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN all the content items will be visible", () => {
        cy.mount(<DefaultTabstrip width={400} />);
        cy.findByRole("tablist").should("have.class", "saltTabstripNext");
        cy.findAllByRole("tab")
          .should("have.length", 5)
          .eq(4)
          .should("be.visible");
      });
      it("THEN no overflow indicator will be present", () => {
        cy.mount(<DefaultTabstrip width={400} />);
        cy.findByRole("tablist").findByRole("combobox").should("not.exist");
      });
    });

    describe("WHEN resized such that space is sufficient for only 4 tabs (first tab selected)", () => {
      it("THEN first 4 tabs will be displayed, with overflow indicator", () => {
        cy.mount(<DefaultTabstrip width={400} />);
        cy.get(".saltTabstripNext").invoke("css", "width", "350px");
        cy.findAllByRole("tab").should("have.length", 4);
        cy.findByRole("combobox").should("exist").click();
        cy.findByRole("listbox")
          .findAllByRole("option")
          .should("have.length", 1);
      });
    });
  });
  describe("WHEN size is not the full width of it's parent", () => {
    it("THEN should not overflow if it has enough space", () => {
      cy.mount(<ControlledTabstrip width={500} />);
      cy.findByRole("combobox").should("not.exist");
    });
    it.only("THEN should overflow if it there is not enough space", () => {
      cy.mount(<ControlledTabstrip width={450} />);
      cy.findByRole("combobox").should("exist");
    });
  });
});

describe("Tab selection, Given a Tabstrip", () => {
  describe("WHEN initial size is NOT sufficient to display all contents", () => {
    describe("WHEN the selected Tab is in the overflow menu", () => {
      it("THEN the active tab will be moved from the overflow menu to the end of visible tabs", () => {
        cy.mount(<DefaultTabstrip width={220} />);
        cy.findAllByRole("tab", { name: "Home" }).should(
          "have.attr",
          "aria-selected",
          "true"
        );
        cy.findByRole("combobox").realClick();
        cy.findByRole("listbox").should("be.visible");
        cy.findByRole("option", { name: "Loans" }).click();
        cy.findAllByRole("tab", { name: "Loans" }).should("be.visible");
        cy.findAllByRole("tab", { name: "Loans" }).should(
          "have.attr",
          "aria-selected",
          "true"
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
              <DefaultTabstrip width={400} />
              <button data-testid="tabstop-2" />
            </StackLayout>
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
                <DefaultTabstrip width={400} />
                <button data-testid="tabstop-2" />
              </StackLayout>
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
              <DefaultTabstrip width={400} />
              <button data-testid="tabstop-2" />
            </StackLayout>
          );
          cy.findByTestId("tabstop-1").focus();
          cy.findAllByRole("tab").eq(0).realClick();
          cy.get('[role="tab"]').eq(0).should("be.focused");
        });

        describe("WHEN the left arrow key is pressed (from first tab)", () => {
          it("THEN no navigation will occur", () => {
            cy.mount(<DefaultTabstrip width={400} />);
            cy.findAllByRole("tab").eq(0).realClick();
            cy.findAllByRole("tab").eq(0).should("be.focused");
            cy.realPress("ArrowLeft");
            cy.findAllByRole("tab").eq(0).should("be.focused");
          });
        });

        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transferred to the next tab", () => {
            cy.mount(<DefaultTabstrip width={400} />);
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
                <DefaultTabstrip width={400} />
                <button data-testid="tabstop-2" />
              </StackLayout>
            );
            cy.findAllByRole("tab").eq(0).realClick();
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(1).should("be.focused");
            cy.realPress("Tab");
            cy.findByTestId("tabstop-2").should("be.focused");
          });
        });

        describe("WHEN focus returns to the tabstrip", () => {
          it("THEN the last focused tab receives focus", () => {
            cy.mount(
              <StackLayout>
                <button data-testid="tabstop-1" />
                <DefaultTabstrip width={400} />
                <button data-testid="tabstop-2" />
              </StackLayout>
            );
            cy.findAllByRole("tab").eq(0).should("be.visible");
            cy.findAllByRole("tab").eq(0).realClick();
            cy.realPress("ArrowRight");
            cy.findAllByRole("tab").eq(1).should("be.focused");
            cy.realPress("Tab");
            cy.findByTestId("tabstop-2").should("be.focused");
            cy.realPress(["Shift", "Tab"]);
            cy.findAllByRole("tab").eq(1).should("be.focused");
          });
        });

        describe("WHEN the right arrow key is pressed repeatedly", () => {
          it("THEN focus will be transferred until last tab is reached", () => {
            cy.mount(<DefaultTabstrip width={400} />);
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
            cy.findAllByRole("tab").eq(4).should("be.focused");
          });
        });
      });
    });
  });
  describe("WHEN initial size is not sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN overflow indicator is included in keyboard navigation", () => {
        cy.mount(<DefaultTabstrip width={310} />);
        cy.findAllByRole("tab").eq(0).realClick();
        cy.findByRole("combobox").should("be.visible");
        cy.realPress("Tab");
        cy.findByRole("combobox").should("be.focused");
      });

      it("THEN overflow indicator opens overflow menu", () => {
        cy.mount(<DefaultTabstrip width={320} />);
        cy.findByRole("combobox").focus().realPress("Enter");
        cy.findByRole("listbox");
      });
    });
  });
  describe("WHEN overflow is opened", () => {
    it("THEN overflow menu can be navigated up and down", () => {
      cy.mount(<DefaultTabstrip width={100} />);
      cy.findByRole("combobox").click();
      cy.findByRole("listbox");
      cy.focused().realPress("ArrowDown");
      cy.findAllByRole("option")
        .should("have.length", 4)
        .eq(1)
        .should("have.class", "saltHighlighted");
      cy.focused().then(($container) => {
        cy.findAllByRole("option")
          .should("have.length", 4)
          .eq(1)
          .then(($el) => {
            expect($container.attr("aria-activedescendant")).to.equal(
              $el.attr("id")
            );
          });
      });
      cy.focused().realPress("ArrowUp");
      cy.findAllByRole("option")
        .should("have.length", 4)
        .eq(0)
        .should("have.class", "saltHighlighted");
    });
    it("THEN overflow menu can be closed with Escape", () => {
      cy.mount(<DefaultTabstrip width={100} />);
      cy.findByRole("combobox").click();
      cy.findByRole("listbox").should("exist");
      cy.focused().realPress("Escape");
      cy.findByRole("listbox").should("not.exist");
    });
    it("THEN overflow menu item can be selected with Enter and focus is moved to the active tab", () => {
      cy.mount(<DefaultTabstrip width={120} />);
      cy.findByRole("combobox").click();
      cy.findByRole("listbox").should("exist");
      cy.focused().realPress("ArrowDown").realPress("Enter");
      cy.focused()
        .should("have.attr", "aria-selected", "true")
        .should("have.attr", "role", "tab");
    });
  });
});
