import { composeStories } from "@storybook/testing-react";
import * as tabstripStories from "@stories/tabstrip-next/tabstrip-next.stories";
import { StackLayout } from "@salt-ds/core";

const { SimpleTabstrip } = composeStories(tabstripStories);

describe("Responsive rendering, Given a Tabstrip", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN all the content items will be visible", () => {
        cy.mount(<SimpleTabstrip width={400} />);
        cy.findByRole("tablist").should("have.class", "saltTabstripNext");
        cy.get(".saltTabstripNext-inner")
          .findAllByRole("tab")
          .should("have.length", 5)
          .eq(4)
          .should("be.visible");
      });
      it("THEN no overflow indicator will be present", () => {
        cy.mount(<SimpleTabstrip width={400} />);
        cy.findByRole("tablist").findByRole("button").should("not.exist");
      });
    });

    describe("WHEN resized such that space is sufficient for only 4 tabs (first tab selected)", () => {
      it(
        "THEN first 4 tabs will be displayed, with overflow indicator",
        { scrollBehavior: false },
        () => {
          cy.mount(<SimpleTabstrip width={400} />);
          cy.get(".saltTabstripNext").invoke("css", "width", "320px");
          cy.get(".saltTabstripNext-inner")
            .findAllByRole("tab")
            .should("have.length", 5)
            .eq(4)
            .should("not.be.visible");
          cy.findByRole("combobox").should("exist").click();
          cy.findByRole("listbox")
            .findAllByRole("option")
            .should("have.length", 1);
        }
      );
    });
  });
});

describe("Tab selection, Given a Tabstrip", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      describe("WHEN the selected Tab has not been specified", () => {
        it("THEN the first tab will be selected", () => {
          cy.mount(<SimpleTabstrip width={400} />);
          cy.get(".saltTabstripNext-inner > *:first-child").should(
            "have.ariaSelected"
          );
        });
      });
    });
  });
});

describe("Navigation, Given a Tabstrip", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN the tabstrip is first rendered", () => {
      describe("WHEN the tabstrip receives keyboard focus", () => {
        it("THEN focus will be transfered to the first tab", () => {
          cy.mount(
            <StackLayout>
              <button data-testid="tabstop-1" />
              <SimpleTabstrip width={400} />
              <button data-testid="tabstop-2" />
            </StackLayout>
          );
          cy.findByTestId("tabstop-1").focus();
          cy.realPress("Tab");
          cy.get(".saltTabstripNext-inner > *:nth-child(1)").should(
            "be.focused"
          );
        });
        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transfered to the next tab", () => {
            cy.mount(
              <StackLayout>
                <button data-testid="tabstop-1" />
                <SimpleTabstrip width={400} />
                <button data-testid="tabstop-2" />
              </StackLayout>
            );
            cy.findByTestId("tabstop-1").focus();
            cy.realPress("Tab");
            cy.get(".saltTabstripNext-inner > *:nth-child(1)").should(
              "be.focused"
            );
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.get(".saltTabstripNext-inner > *:nth-child(2)").should(
              "be.focused"
            );
          });
        });
      });

      describe("WHEN the selected tab is clicked", () => {
        it("THEN focus will be transfered to the selected tab", () => {
          cy.mount(
            <StackLayout>
              <button data-testid="tabstop-1" />
              <SimpleTabstrip width={400} />
              <button data-testid="tabstop-2" />
            </StackLayout>
          );
          cy.findByTestId("tabstop-1").focus();
          cy.get(".saltTabstripNext-inner > *:first-child").realClick();
          cy.get(".saltTab").eq(0).should("be.focused");
        });

        describe("WHEN the left arrow key is pressed (from first tab)", () => {
          it("THEN no navigation will occur", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstripNext-inner > *:nth-child(1)").realClick();
            cy.wait(100); // ArrowRight need some time to move focus after click
            cy.realPress("ArrowLeft");
            cy.get(".saltTabstripNext-inner > *:nth-child(1)").should(
              "be.focused"
            );
          });
        });

        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transfered to the next tab", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstripNext-inner > *:first-child").realClick();
            cy.wait(100); // ArrowRight need some time to move focus after click
            cy.realPress("ArrowRight");
            cy.get(".saltTabstripNext-inner > *:nth-child(2)").should(
              "be.focused"
            );
          });
        });

        describe("WHEN the tab key is pressed", () => {
          it("THEN focus will leave the tabstrip", () => {
            cy.mount(
              <StackLayout>
                <button data-testid="tabstop-1" />
                <SimpleTabstrip width={400} />
                <button data-testid="tabstop-2" />
              </StackLayout>
            );
            cy.get(".saltTabstripNext-inner > *:first-child").realClick();
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("Tab");
            cy.findByTestId("tabstop-2").should("be.focused");
          });
        });

        describe("WHEN focus returns to the tabstrip", () => {
          it("THEN the selected tab receives focus", () => {
            cy.mount(
              <StackLayout>
                <button data-testid="tabstop-1" />
                <SimpleTabstrip width={400} />
                <button data-testid="tabstop-2" />
              </StackLayout>
            );
            cy.get(".saltTabstripNext-inner > *:first-child").should(
              "be.visible"
            );
            cy.get(".saltTabstripNext-inner > *:first-child").realClick();
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("Tab");
            cy.wait(50);
            cy.realPress(["Shift", "Tab"]);
            cy.wait(50);
            cy.get(".saltTabstripNext-inner > *:first-child")
              .should("be.focused")
              .should("have.ariaSelected");
          });
        });

        describe("WHEN the right arrow key is pressed repeatedly", () => {
          it("THEN focus will be transfered until last tab is reached", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstripNext-inner > *:first-child").realClick();
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.get(".saltTabstripNext-inner > *:nth-child(5)").should(
              "be.focused"
            );
            cy.realPress("ArrowRight");
            cy.get(".saltTabstripNext-inner > *:nth-child(5)").should(
              "be.focused"
            );
          });
        });
      });
    });
  });
  describe("WHEN initial size is not sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN overflow indicator is included in keyboard navigation", () => {
        cy.mount(<SimpleTabstrip width={320} />);
        cy.get(".saltTabstripNext-inner > *:first-child").realClick();
        cy.wait(50);
        cy.realPress("ArrowRight");
        cy.wait(50);
        cy.realPress("ArrowRight");
        cy.wait(50);
        cy.realPress("ArrowRight");
        cy.wait(50);
        cy.realPress("ArrowRight");
        cy.findByRole("combobox").should("be.focused");
      });
    });
  });
});

