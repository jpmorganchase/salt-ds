import { composeStories } from "@storybook/react";
import * as tabstripStories from "@stories/tabstrip/tabstrip.cypress.stories";
import * as tabsStories from "@stories/tabs/tabs.stories";
import { Tabs, TabPanel } from "@salt-ds/lab";
import { version } from "react";

const { SimpleTabstrip, SimpleTabstripAddRemoveTab } =
  composeStories(tabstripStories);
const { AddNew, Close, Controlled } = composeStories(tabsStories);

const OVERFLOWED_ITEMS = '.saltTabstrip-inner > *[data-overflowed="true"]';
const OVERFLOW_IND = '.saltTabstrip-inner > *[data-overflow-indicator="true"]';
const ADD_BUTTON = '.saltTabstrip-inner  > *[aria-label="Create Tab"]';

describe("Responsive rendering, Given a Tabstrip", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN all the content items will be visible", () => {
        cy.mount(<SimpleTabstrip width={400} />);
        const tabstrip = cy.findByRole("tablist");
        tabstrip.should("have.class", "saltTabstrip");
        cy.get(".saltTabstrip-inner > *")
          .should("have.length", 5)
          .filter(":visible")
          .should("have.length", 5);
      });
      it("THEN no items will be overflowed", () => {
        cy.mount(<SimpleTabstrip width={400} />);
        cy.get(OVERFLOWED_ITEMS).should("have.length", 0);
      });
      it("THEN no overflow indicator will be present", () => {
        cy.mount(<SimpleTabstrip width={400} />);
        cy.get(OVERFLOW_IND).should("have.length", 0);
      });
    });

    describe("WHEN resized such that space is sufficient for only 4 tabs (first tab selected)", () => {
      it("THEN first 4 tabs will be displayed, with overflow indicator", () => {
        cy.mount(<SimpleTabstrip width={400} />);
        cy.get(".saltTabstrip").invoke("css", "width", "320px");
        cy.get(".saltTabstrip-inner > *")
          .should("have.length", 5)
          .filter(":visible")
          .should("have.length", 4);
        cy.get(OVERFLOWED_ITEMS).should("have.length", 1);
        cy.get(
          '.saltTabstrip-inner > *:nth-child(5)[data-overflowed="true"]'
        ).should("have.length", 1);
        cy.get(OVERFLOW_IND).should("have.length", 1);
      });
    });

    describe("WHEN resized such that space is sufficient for only 4 tabs (LAST tab selected)", () => {
      it("THEN  as last tab is selected, last but one will be overflowed", () => {
        cy.mount(<SimpleTabstrip activeTabIndex={4} width={400} />);
        cy.get(".saltTabstrip").invoke("css", "width", "340px");
        cy.get(".saltTabstrip-inner > *")
          .should("have.length", 5)
          .filter(":visible")
          .should("have.length", 4);
        cy.get(OVERFLOWED_ITEMS).should("have.length", 1);
        cy.get(
          '.saltTabstrip-inner > *:nth-child(4)[data-overflowed="true"]'
        ).should("have.length", 1);
        cy.get(OVERFLOW_IND).should("have.length", 1);
      });
    });
  });
  describe("WHEN initial size is not sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN not all content items will be visible", () => {
        cy.mount(<SimpleTabstrip width={320} />);
        cy.get(".saltTabstrip-inner > *")
          .should("have.length", 6)
          .filter(":visible")
          .should("have.length", 5);
        cy.get(OVERFLOWED_ITEMS).should("have.length", 1);
        cy.get(OVERFLOW_IND).should("have.length", 1);
      });
    });
  });
});

describe("Tab selection, Given a Tabstrip", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      describe("WHEN the selected Tab has not been specified", () => {
        it("THEN the first tab will be selected", () => {
          cy.mount(<SimpleTabstrip width={400} />);
          cy.get(".saltTabstrip-inner > *:first-child").should(
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
          cy.mount(<SimpleTabstrip width={400} />);
          cy.findByTestId("tabstop-1").focus();
          cy.realPress("Tab");
          cy.get(".saltTabstrip-inner > *:nth-child(1)")
            .should("be.focused")
            .should("be.focusVisible");
        });
        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transfered to the next tab", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.findByTestId("tabstop-1").focus();
            cy.realPress("Tab");
            cy.get(".saltTabstrip-inner > *:nth-child(1)")
              .should("be.focused")
              .should("be.focusVisible");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.get(".saltTabstrip-inner > *:nth-child(2)")
              .should("be.focused")
              .should("be.focusVisible");
          });
        });
      });

      describe("WHEN the selected tab is clicked", () => {
        it("THEN focus will be transfered to the selected tab", () => {
          cy.mount(<SimpleTabstrip width={400} />);
          cy.findByTestId("tabstop-1").focus();
          cy.get(".saltTabstrip-inner > *:first-child").realClick();
          cy.get(".saltTabstrip-inner > *:first-child").should(
            "not.be.focusVisible"
          );
          cy.get(".saltTab").eq(0).should("be.focused");
        });

        describe("WHEN the left arrow key is pressed (from first tab)", () => {
          it("THEN no navigation will occur", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstrip-inner > *:nth-child(1)").realClick();
            cy.get(".saltTabstrip-inner > *:nth-child(1)").should(
              "not.be.focusVisible"
            );
            cy.wait(100); // ArrowRight need some time to move focus after click
            cy.realPress("ArrowLeft");
            cy.get(".saltTabstrip-inner > *:nth-child(1)").should(
              "be.focusVisible"
            );
          });
        });

        describe("WHEN the right arrow key is pressed", () => {
          it("THEN focus will be transfered to the next tab", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstrip-inner > *:first-child").realClick();
            cy.wait(100); // ArrowRight need some time to move focus after click
            cy.realPress("ArrowRight");
            cy.get(".saltTabstrip-inner > *:nth-child(2)")
              .should("be.focused")
              .should("be.focusVisible");
          });
        });

        describe("WHEN the tab key is pressed", () => {
          it("THEN focus will leave the tabstrip", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstrip-inner > *:first-child").realClick();
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("Tab");
            cy.findByTestId("tabstop-2").should("be.focused");
            cy.get(".saltTabstrip-inner > .saltFocusVisible").should(
              "have.length",
              0
            );
          });
        });

        describe("WHEN focus returns to the tabstrip", () => {
          it("THEN the selected tab receives focus", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstrip-inner > *:first-child").should("be.visible");
            cy.get(".saltTabstrip-inner > *:first-child").realClick();
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("Tab");
            cy.wait(50);
            cy.realPress(["Shift", "Tab"]);
            cy.wait(50);
            cy.get(".saltTabstrip-inner > *:first-child")
              .should("be.focused")
              .should("be.focusVisible")
              .should("have.ariaSelected");
          });
        });

        describe("WHEN the right arrow key is pressed repeatedly", () => {
          it("THEN focus will be transfered until last tab is reached", () => {
            cy.mount(<SimpleTabstrip width={400} />);
            cy.get(".saltTabstrip-inner > *:first-child").realClick();
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.wait(50);
            cy.realPress("ArrowRight");
            cy.get(".saltTabstrip-inner > *:nth-child(5)")
              .should("be.focused")
              .should("be.focusVisible");
            cy.realPress("ArrowRight");
            cy.get(".saltTabstrip-inner > *:nth-child(5)")
              .should("be.focused")
              .should("be.focusVisible");
          });
        });
      });
    });
  });
  describe("WHEN initial size is not sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it(
        "THEN overflow indicator is included in keyboard navigation",
        // Doesn't work in React 18
        !version.startsWith("18")
          ? () => {
              cy.mount(<SimpleTabstrip width={320} />);
              cy.get(".saltTabstrip-inner > *:first-child").realClick();
              cy.wait(50);
              cy.realPress("ArrowRight");
              cy.wait(50);
              cy.realPress("ArrowRight");
              cy.wait(50);
              cy.realPress("ArrowRight");
              cy.wait(50);
              cy.realPress("ArrowRight");
              cy.get(`${OVERFLOW_IND} > .saltButton`).should("be.focused");
            }
          : undefined
      );
    });
  });
});

describe("Editable Tabs", () => {
  describe("WHEN enableRenameTab is set", () => {
    it("THEN all tabs are editable", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner .saltEditableLabel").should("have.length", 5);
    });
  });

  describe("WHEN ENTER is pressed on tab selected via keyboard", () => {
    it("THEN tab enters edit state", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner > *:first-child").realClick();
      cy.wait(100); // ArrowRight need some time to move focus after click
      // Navigate to second tab ...
      cy.realPress("ArrowRight");
      // First press of ENTER selects ...
      cy.realPress("Enter");
      // Second press enters edit mode ...
      cy.realPress("Enter");
      cy.get(".saltTabstrip-inner  > *:nth-child(2) .saltEditableLabel").should(
        "have.class",
        "saltEditableLabel-editing"
      );
      cy.get(
        ".saltTabstrip-inner  > *:nth-child(2) .saltEditableLabel-input"
      ).should("be.focused");
    });
  });

  describe("WHEN ENTER is pressed on tab selected via click", () => {
    it("THEN tab label enters edit state", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner > *:first-child").realClick();
      cy.realPress("Enter");
      cy.get(".saltTabstrip-inner  > *:first-child .saltEditableLabel").should(
        "have.class",
        "saltEditableLabel-editing"
      );
      cy.get(
        ".saltTabstrip-inner  > *:first-child .saltEditableLabel-input"
      ).should("be.focused");
    });
  });

  describe("WHEN editable tab is double clicked", () => {
    it("THEN tab label enters edit state", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner > *:first-child").dblclick();
      cy.get(".saltTabstrip-inner  > *:first-child .saltEditableLabel").should(
        "have.class",
        "saltEditableLabel-editing"
      );
      cy.get(
        ".saltTabstrip-inner  > *:first-child .saltEditableLabel-input"
      ).should("be.focused");
    });
  });

  describe("WHEN characters are typed during edit state", () => {
    it("THEN editable input value is updated", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner > *:first-child").realClick();
      cy.realPress("Enter");
      cy.realType("test");
      cy.get(
        ".saltTabstrip-inner  > *:first-child .saltEditableLabel-input"
      ).should("have.attr", "value", "test");
    });
  });
  describe("WHEN ENTER is pressed after edit", () => {
    it("THEN edited value is applied to tab label", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner > *:first-child").realClick();
      cy.realPress("Enter");
      cy.realType("test");
      cy.realPress("Enter");
      cy.get(
        ".saltTabstrip-inner  > *:first-child .saltEditableLabel-input"
      ).should("have.length", 0);
      cy.get(".saltTabstrip-inner  > *:first-child .saltEditableLabel").should(
        "have.text",
        "test"
      );
      cy.get(".saltTabstrip-inner  > *:first-child").should("be.focused");
    });
  });
  describe("WHEN ESC is pressed after edit", () => {
    it("THEN edited value is not applied to tab label", () => {
      cy.mount(<SimpleTabstrip enableRenameTab width={400} />);
      cy.get(".saltTabstrip-inner > *:first-child").realClick();
      cy.realPress("Enter");
      cy.realType("test");
      cy.realPress("Escape");
      cy.get(
        ".saltTabstrip-inner  > *:first-child .saltEditableLabel-input"
      ).should("have.length", 0);
      cy.get(".saltTabstrip-inner  > *:first-child .saltEditableLabel").should(
        "have.text",
        "Home"
      );
      cy.get(".saltTabstrip-inner  > *:first-child").should("be.focused");
    });
  });
});

describe("Removing Tabs.", () => {
  describe("GIVEN a controlled Tabstrip.", () => {
    describe("WHEN enableCloseTab is set", () => {
      it("THEN all tabs are closeable", () => {
        cy.mount(<SimpleTabstripAddRemoveTab enableCloseTab width={600} />);
        cy.get(".saltTabstrip-inner .saltTab-closeButton").should(
          "have.length",
          5
        );
      });

      describe("WHEN close button is clicked", () => {
        it("THEN tab is closed", () => {
          cy.mount(<SimpleTabstripAddRemoveTab enableCloseTab width={600} />);
          cy.get(
            ".saltTabstrip-inner > *:first-child .saltTab-closeButton"
          ).realClick();
          cy.get(".saltTabstrip-inner > .saltTab").should("have.length", 4);
        });
      });

      describe("WHEN backspace button is pressed and closeable tab has focus", () => {
        it("THEN tab is closed", () => {
          cy.mount(<SimpleTabstripAddRemoveTab enableCloseTab width={600} />);
          // Select the first tab ...
          cy.get(".saltTab").eq(0).realClick();
          // Close the selected tab
          cy.realPress("Backspace");
          cy.get(".saltTab").should("have.length", 4);
          // The (new) first tab should now be selected and focused
          cy.get(".saltTab").eq(0).should("have.ariaSelected");
          cy.get(".saltTab").eq(0).should("be.focused");
        });
      });
    });
  });

  describe("GIVEN a controlled Tabs component", () => {
    describe("WHEN enableCloseTab is set", () => {
      it("THEN tabs are by default closeable", () => {
        cy.mount(<Controlled />);
        cy.get(".saltTab-closeButton").should("have.length", 5);
      });
    });
    describe("WHEN enableCloseTab is not set", () => {
      it("THEN tabPanels are closeable if individually configured", () => {
        cy.mount(<Close />);
        cy.get(".saltTab:not([data-overflowed]) .saltTab-closeButton").should(
          "have.length",
          3
        );
      });
    });
  });
});

describe("Adding Tabs", () => {
  describe("GIVEN a controlled Tabstrip", () => {
    describe("WHEN enableAddTab is set", () => {
      it("THEN add button is rendered", () => {
        cy.mount(<SimpleTabstripAddRemoveTab enableAddTab width={600} />);
        cy.get(".saltTabstrip-inner > *").should("have.length", 6);
        cy.get(".saltTabstrip-inner > *:nth-child(6)").should(
          "have.attr",
          "aria-label",
          "Create Tab"
        );
      });
      it("THEN add button is included in navigation", () => {
        cy.mount(<SimpleTabstripAddRemoveTab enableAddTab width={600} />);
        cy.get(".saltTabstrip-inner > *:nth-child(3)").realClick();
        cy.wait(100); // ArrowRight need some time to move focus after click
        cy.realPress("ArrowRight");
        cy.realPress("ArrowRight");
        cy.realPress("ArrowRight");
        cy.get(ADD_BUTTON).should("be.focused");
      });
      describe("WHEN Add Tab button is clicked", () => {
        it("THEN new last Tab is created, selected and enters edit mode", () => {
          cy.mount(
            <SimpleTabstripAddRemoveTab
              enableAddTab
              enableRenameTab
              width={600}
            />
          );
          cy.get(ADD_BUTTON).realClick();
          cy.get(".saltTabstrip-inner > *").should("have.length", 7);
          cy.get(
            ".saltTabstrip-inner > *:nth-child(6) .saltEditableLabel-input"
          ).should("have.value", "Tab 6");
          cy.get(".saltTabstrip-inner > *:nth-child(6)").should(
            "have.attr",
            "aria-selected"
          );
          cy.get(
            ".saltTabstrip-inner  > *:nth-child(6) .saltEditableLabel-input"
          ).should("be.focused");

          cy.get(".saltTabstrip-inner > *:nth-child(7)").should(
            "have.attr",
            "aria-label",
            "Create Tab"
          );
        });
      });
      describe("WHEN Add button is focused and ENTER pressed", () => {
        it("THEN new last Tab is created, selected and entered edit mode", () => {
          cy.mount(
            <SimpleTabstripAddRemoveTab
              enableAddTab
              enableRenameTab
              width={600}
            />
          );
          cy.get(".saltTab").eq(4).realClick();
          cy.wait(100);
          cy.realPress("ArrowRight");
          cy.wait(100);
          cy.realPress("Enter");
          cy.get(".saltTabstrip-inner > *").should("have.length", 7);
          cy.get(
            ".saltTabstrip-inner > *:nth-child(6) .saltEditableLabel-input"
          ).should("have.value", "Tab 6");
          cy.get(".saltTabstrip-inner > *:nth-child(6)").should(
            "have.attr",
            "aria-selected"
          );
          cy.get(
            ".saltTabstrip-inner  > *:nth-child(6) .saltEditableLabel-input"
          ).should("be.focused");
        });
      });

      describe("WHEN promptForNewTabName is false", () => {
        it("THEN new Tab will be created but not in edit mode", () => {
          cy.mount(
            <SimpleTabstripAddRemoveTab
              enableAddTab
              enableRenameTab
              promptForNewTabName={false}
              width={600}
            />
          );
          cy.get(ADD_BUTTON).realClick();
          cy.get(
            ".saltTabstrip-inner  > *:nth-child(6) .saltEditableLabel"
          ).should("not.have.class", "saltEditableLabel-editing");
        });

        // it("THEN new Tab is editable", () => {
        //   cy.mount(<SimpleTabstripAddRemoveTab enableAddTab />);
        //   cy.get(".saltTabstrip-inner > *:nth-child(5)").realClick();
        //   cy.realPress("ArrowRight");
        //   cy.realPress("Enter");
        //   cy.get(".saltTabstrip-inner > *:nth-child(6)").should("be.focused");
        //   cy.realPress("Enter");
        //   cy.get(
        //     ".saltTabstrip-inner  > *:nth-child(6) .saltEditableLabel"
        //   ).should("have.class", "saltEditableLabel-editing");
        // });
      });
    });
  });

  describe("GIVEN a controlled Tabs component", () => {
    describe("WHEN enableAddTab is set", () => {
      it("THEN add button is rendered", () => {
        cy.mount(<AddNew />);
        cy.get(".saltTabstrip-inner > *").should("have.length", 6);
        cy.get(".saltTabstrip-inner > *")
          .eq(5)
          .should("have.attr", "aria-label", "Create Tab");
      });
    });

    describe("WHEN Add Tab button is clicked  using mouse", () => {
      it("THEN onAddTab callback prop is invoked", () => {
        const onAddTab = cy.stub().as("addTabHandler");
        cy.mount(
          <Tabs enableAddTab onAddTab={onAddTab} style={{ width: 600 }}>
            <TabPanel label="test" />
          </Tabs>
        );
        cy.findByRole("button", { name: "Create Tab" }).should("be.visible");
        cy.findByRole("button", { name: "Create Tab" }).realClick();
        cy.get("@addTabHandler").should("have.been.called");
      });
      it("THEN new last Tab is created in last position, selected and focused, but not focusVisible", () => {
        cy.mount(<AddNew />);
        cy.findByRole("button", { name: "Create Tab" }).realClick();
        cy.get(".saltTabstrip-inner > *").should("have.length", 7);
        cy.get(".saltFocusVisible").should("have.length", 0);
        cy.get(".saltTab-text").eq(5).should("have.text", "Tab 6");
        cy.get(".saltTab").eq(5).should("have.ariaSelected");
        cy.get(".saltTab").eq(5).should("be.focused");
        cy.get(".saltTabstrip-inner > *:nth-child(7)").should(
          "have.attr",
          "aria-label",
          "Create Tab"
        );
      });
    });

    describe("WHEN Add Tab button is clicked  using keyboard", () => {
      it("THEN new last Tab is created in last position, selected and focused, and is focusVisible", () => {
        cy.mount(<AddNew />);
        cy.wait(50);
        cy.get(".saltTab").eq(4).realClick();
        cy.wait(100);
        cy.realPress("ArrowRight");
        cy.wait(100);
        cy.realPress("Enter");
        cy.get(".saltTabstrip-inner > *").should("have.length", 7);
        cy.get(".saltTab-text").eq(5).should("have.text", "Tab 6");
        cy.get(".saltTab").eq(5).should("have.ariaSelected");
        cy.get(".saltTab").eq(5).should("be.focusVisible");
        cy.get(".saltTab").eq(5).should("be.focused");
        cy.get(".saltTabstrip-inner > *:nth-child(7)").should(
          "have.attr",
          "aria-label",
          "Create Tab"
        );
      });
    });

    describe("WHEN Add Tab button is clicked multiple times", () => {
      it("THEN new Tabs get added to end of tabs list", () => {
        cy.mount(<AddNew />);
        cy.findByRole("button", { name: "Create Tab" })
          .realClick()
          .realClick()
          .realClick();

        cy.get(".saltTabstrip-inner > *").should("have.length", 9);
        cy.get(".saltFocusVisible").should("have.length", 0);
        cy.get(".saltTab-text").eq(5).should("have.text", "Tab 6");
        cy.get(".saltTab-text").eq(6).should("have.text", "Tab 7");
        cy.get(".saltTab-text").eq(7).should("have.text", "Tab 8");
        cy.get(".saltTab").eq(7).should("have.ariaSelected");
        cy.get(".saltTab").eq(7).should("be.focused");
        cy.get(".saltTabstrip-inner > *:nth-child(9)").should(
          "have.attr",
          "aria-label",
          "Create Tab"
        );
      });
    });

    describe("WHEN insufficient space is available to display new tab", () => {
      it("THEN overflow is triggered", () => {
        cy.mount(<AddNew />);
        cy.findByRole("button", { name: "Create Tab" })
          .realClick()
          .realClick()
          .realClick()
          .realClick();

        cy.get(".saltTabstrip-inner > *").should("have.length", 10);
        cy.get('[data-overflow-indicator="true"]').should("have.length", 1);

        cy.get(".saltTab-text").eq(8).should("have.text", "Tab 9");
        cy.get(".saltTabstrip-inner > *:nth-child(10)").should(
          "have.attr",
          "data-overflow-indicator",
          "true"
        );
        cy.get(".saltTabstrip-inner > *:nth-child(11)").should(
          "have.attr",
          "aria-label",
          "Create Tab"
        );
      });
      it("THEN new tab is selected and remains visible", () => {
        cy.mount(<AddNew />);
        cy.findByRole("button", { name: "Create Tab" })
          .realClick()
          .realClick()
          .realClick()
          .realClick();

        cy.get(".saltTabstrip-inner > *")
          .filter(":visible")
          .should("have.length", 10);

        cy.get(".saltTab").eq(7).should("not.be.visible");
        cy.get(".saltTab").eq(8).should("be.visible");
        cy.get(".saltTab").eq(8).should("have.ariaSelected");
        cy.get(".saltTab").eq(8).should("be.focused");
      });

      it(
        "THEN additional tabs are added before overflow indicator",
        // Unstable in React 18
        !version.startsWith("18")
          ? () => {
              cy.mount(<AddNew />);
              cy.findByRole("button", { name: "Create Tab" })
                .realClick()
                .realClick()
                .realClick()
                .realClick();

              cy.wait(50);
              cy.findByRole("button", { name: "Create Tab" })
                .realClick()
                .then(() => {
                  cy.get(".saltTabstrip-inner > *")
                    .filter(":visible")
                    .should("have.length", 10);

                  cy.get(".saltTab").eq(7).should("not.be.visible");
                  cy.get(".saltTab").eq(8).should("not.be.visible");
                  cy.get(".saltTab").eq(9).should("be.visible");
                  cy.get(".saltTab").eq(9).should("have.ariaSelected");
                  cy.get(".saltTab").eq(9).should("be.focused");
                });
            }
          : undefined
      );
    });
  });
});

describe("7) Focus management", () => {
  describe("WHEN initially rendered", () => {
    it("THEN all tabs have tabindex -1, except for selected tab which has 0", () => {
      cy.mount(<SimpleTabstrip enableAddTab width={600} />);
      cy.get('.saltTabstrip-inner > .saltTab[tabindex="-1"]').should(
        "have.length",
        4
      );
      cy.get(
        '.saltTabstrip-inner > .saltTab[tabindex="0"][aria-selected="true"]'
      ).should("have.length", 1);
    });
  });

  describe("WHEN Tabstrip receives focus", () => {
    it("THEN all tabs have tabindex -1, including selected tab", () => {
      cy.mount(<SimpleTabstrip enableAddTab width={600} />);
      cy.get(".saltTabstrip-inner > *:first-child").realClick();
      cy.get('.saltTabstrip-inner > .saltTab[tabindex="-1"]').should(
        "have.length",
        5
      );
      cy.get(
        '.saltTabstrip-inner > .saltTab[tabindex="-1"][aria-selected="true"]'
      ).should("have.length", 1);
    });
  });

  describe("WHEN Tab key is pressed", () => {
    it("THEN Tabstrip loses focus", () => {
      cy.mount(<SimpleTabstrip enableAddTab width={600} />);
      cy.get(".saltTabstrip-inner > *:nth-child(2)").realClick();
      cy.wait(100); // ArrowRight need some time to move focus after click
      cy.realPress("Tab");
      cy.get('.saltTabstrip-inner > .saltTab[tabindex="-1"]').should(
        "have.length",
        4
      );
      cy.get(
        '.saltTabstrip-inner > .saltTab[tabindex="0"][aria-selected="true"]'
      ).should("have.length", 1);
    });
  });
});
