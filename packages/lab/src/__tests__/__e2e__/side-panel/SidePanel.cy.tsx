import { SidePanel, SidePanelProvider, SidePanelTrigger } from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(sidePanel);
const {
  Left,
  Default,
  ManualTrigger,
  Variants,
  WithTable,
  Nested,
  Scrollable,
  WithNav,
} = composedStories;
describe("GIVEN a SidePanel component", () => {
  checkAccessibility(composedStories);

  describe("Rendering & Position Variants", () => {
    describe("GIVEN the Left story", () => {
      describe("WHEN panel is opened and closed via button and Escape", () => {
        it("THEN lifecycle and ARIA state are correct", () => {
          cy.mount(<Left />);

          cy.findByRole("region").should("not.exist");

          cy.findByRole("button", { name: "Open left panel" }).should(
            "have.attr",
            "aria-expanded",
            "false",
          );

          cy.findByRole("button", { name: "Open left panel" }).click();
          cy.findByRole("button", { name: "Close left panel" }).should(
            "have.attr",
            "aria-expanded",
            "true",
          );

          cy.findByRole("region", { name: "Section Title" })
            .invoke("attr", "id")
            .then((panelId) => {
              cy.findByRole("button", { name: "Close left panel" }).should(
                "have.attr",
                "aria-controls",
                panelId,
              );
            });

          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );
          cy.findByRole("region").should("have.class", "saltSidePanel-left");

          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("button", { name: "Open left panel" }).should(
            "have.attr",
            "aria-expanded",
            "false",
          );

          cy.findByRole("region").should("not.exist");

          cy.findByRole("button", { name: "Open left panel" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );

          cy.realPress("Escape");
          cy.findByRole("region").should("not.exist");

          cy.findByRole("button", { name: "Open left panel" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );
          cy.findByRole("region").should("have.attr", "role", "region");
        });
      });
    });

    describe("GIVEN the Default story", () => {
      describe("WHEN panel is opened and closed", () => {
        it("THEN ARIA, class, and focus behavior are correct", () => {
          cy.mount(<Default />);

          cy.findByRole("button", { name: "Open right panel" }).should(
            "have.attr",
            "aria-expanded",
            "false",
          );

          cy.findByRole("button", { name: "Open right panel" }).click();
          cy.findByRole("button", { name: "Close right panel" }).should(
            "have.attr",
            "aria-expanded",
            "true",
          );
          cy.findByRole("region")
            .should("have.class", "saltSidePanel-right")
            .and("be.visible");

          cy.findByRole("region", { name: "Section Title" })
            .invoke("attr", "id")
            .then((panelId) => {
              cy.findByRole("button", { name: "Close right panel" }).should(
                "have.attr",
                "aria-controls",
                panelId,
              );
            });

          cy.findByRole("button", { name: "Close" }).should("have.focus");

          cy.realPress("Escape");
          cy.findByRole("region").should("not.exist");
          cy.focused().should("have.text", "Open right panel");

          cy.findByRole("button", { name: "Open right panel" }).click();
          cy.findByRole("button", { name: "Close" }).should("have.focus");

          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("button", { name: "Open right panel" }).should(
            "have.attr",
            "aria-expanded",
            "false",
          );

          cy.findByRole("region").should("not.exist");
          cy.focused().should("have.text", "Open right panel");
        });
      });
    });

    it("WHEN ManualTrigger is used, THEN aria-expanded and aria-controls are managed correctly", () => {
      cy.mount(<ManualTrigger />);

      cy.findByRole("button", { name: "Toggle left panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("button", { name: "Toggle left panel" }).click();

      cy.findByRole("button", { name: "Toggle left panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

      cy.findByRole("region", { name: "Left Panel" })
        .invoke("attr", "id")
        .then((panelId) => {
          cy.findByRole("button", { name: "Toggle left panel" }).should(
            "have.attr",
            "aria-controls",
            panelId,
          );
        });

      cy.findByRole("region", { name: "Left Panel" }).should("be.visible");
    });
  });

  describe("State Management", () => {
    describe("GIVEN a controlled SidePanelProvider", () => {
      describe("WHEN trigger is activated while open is false", () => {
        it("THEN callback fires with true", () => {
          const onOpenChange = cy.stub().as("onOpenChange");

          cy.mount(
            <SidePanelProvider open={false} onOpenChange={onOpenChange}>
              <SidePanelTrigger>
                <button>Open Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Controlled Test">Content</SidePanel>
            </SidePanelProvider>,
          );

          cy.findByRole("region").should("not.exist");

          cy.findByRole("button", { name: "Open Panel" }).click();

          cy.get("@onOpenChange").should("have.been.calledWith", true);
        });
      });

      describe("WHEN Escape is pressed while panel is open", () => {
        it("THEN callback fires with false", () => {
          const onOpenChange = cy.stub().as("onOpenChange");

          cy.mount(
            <SidePanelProvider open={true} onOpenChange={onOpenChange}>
              <SidePanel aria-label="Test Panel">Content</SidePanel>
            </SidePanelProvider>,
          );

          cy.findByRole("region", { name: "Test Panel" })
            .should("be.visible")
            .focus();

          cy.realPress("Escape");

          cy.get("@onOpenChange").should("have.been.calledWith", false);
        });
      });
    });
  });

  describe("Variants", () => {
    describe("GIVEN the Variants story", () => {
      describe("WHEN panel is rendered with defaultOpen=true and reopened", () => {
        it("THEN focus behavior is correct", () => {
          cy.mount(<Variants />);

          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );
          cy.findByRole("button", { name: "Close" }).should("not.have.focus");

          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("region").should("not.exist");

          cy.findByRole("button", { name: /open right panel/i }).click();
          cy.findByRole("button", { name: "Close" }).should("have.focus");
        });
      });

      describe("WHEN variant is changed via radio buttons and panel is reopened", () => {
        it("THEN selected variant is preserved", () => {
          cy.mount(<Variants />);

          // Panel starts open due to defaultOpen={true}, so it's already visible with primary variant
          cy.findByRole("region", { name: "Section Title" })
            .should("be.visible")
            .and("have.class", "saltSidePanel-primary");

          // Switch to secondary
          cy.findByRole("radio", { name: "Secondary" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "have.class",
            "saltSidePanel-secondary",
          );

          // Switch to tertiary
          cy.findByRole("radio", { name: "Tertiary" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "have.class",
            "saltSidePanel-tertiary",
          );

          // Switch back to primary
          cy.findByRole("radio", { name: "Primary" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "have.class",
            "saltSidePanel-primary",
          );

          // Switch to none
          cy.findByRole("radio", { name: "None" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "have.class",
            "saltSidePanel-none",
          );

          cy.findByRole("radio", { name: "Tertiary" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "have.class",
            "saltSidePanel-tertiary",
          );

          // Close and reopen
          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("region").should("not.exist");

          cy.findByRole("button", { name: "Open right panel" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "have.class",
            "saltSidePanel-tertiary",
          );
        });
      });
    });
  });

  describe("WithTable", () => {
    describe("GIVEN the table editing story", () => {
      describe("WHEN different row Edit buttons are clicked sequentially", () => {
        it("THEN details update and table remains visible after close", () => {
          cy.mount(<WithTable />);

          cy.findByRole("table").should("be.visible");
          cy.findByRole("columnheader", { name: "Name" }).should("be.visible");

          cy.findByRole("button", {
            name: "Edit details for Alex Morgan",
          }).click();

          cy.findByRole("region", {
            name: "Alex Morgan Employee Details",
          }).should("be.visible");
          cy.findByRole("region", {
            name: "Alex Morgan Employee Details",
          }).within(() => {
            cy.findByDisplayValue("Alex Morgan").should("be.visible");
            cy.findByDisplayValue("alex.morgan@example.com").should(
              "be.visible",
            );
            cy.findByDisplayValue("+1 212 555 0101").should("be.visible");
          });

          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("region", {
            name: "Alex Morgan Employee Details",
          }).should("not.exist");
          cy.findByRole("table").should("be.visible");

          cy.findByRole("button", {
            name: "Edit details for Jordan Lee",
          }).click();

          cy.findByRole("region", {
            name: "Jordan Lee Employee Details",
          }).should("be.visible");
          cy.findByRole("region", {
            name: "Jordan Lee Employee Details",
          }).within(() => {
            cy.findByDisplayValue("Jordan Lee").should("be.visible");
            cy.findByDisplayValue("jordan.lee@example.com").should(
              "be.visible",
            );
          });
        });
      });

      describe("WHEN Edit buttons are activated and the panel is closed in different ways", () => {
        it("THEN focus moves into the panel on open and returns to the trigger on close", () => {
          cy.mount(<WithTable />);

          // First Edit click — focus moves into the panel
          cy.findByRole("button", {
            name: "Edit details for Alex Morgan",
          }).click();
          cy.findByRole("region", {
            name: "Alex Morgan Employee Details",
          }).should("be.visible");
          cy.findByRole("button", { name: "Close" }).should("have.focus");

          // Switch rows while panel is open — focus moves into the new panel
          cy.findByRole("button", {
            name: "Edit details for Taylor Reed",
          }).click();
          cy.findByRole("region", {
            name: "Taylor Reed Employee Details",
          }).should("be.visible");
          cy.findByRole("button", { name: "Close" }).should("have.focus");

          // Close via Escape — focus returns to the trigger
          cy.realPress("Escape");
          cy.findByRole("region").should("not.exist");
          cy.focused().should(
            "have.attr",
            "aria-label",
            "Edit details for Taylor Reed",
          );

          // Reopen a row — close via Close button — focus returns to the trigger
          cy.findByRole("button", {
            name: "Edit details for Alex Morgan",
          }).click();
          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("region").should("not.exist");
          cy.focused().should(
            "have.attr",
            "aria-label",
            "Edit details for Alex Morgan",
          );

          // Reopen — close via Cancel button — focus returns to the trigger
          cy.findByRole("button", {
            name: "Edit details for Jordan Lee",
          }).click();
          cy.findByRole("button", { name: "Cancel" }).click();
          cy.findByRole("region").should("not.exist");
          cy.focused().should(
            "have.attr",
            "aria-label",
            "Edit details for Jordan Lee",
          );
        });
      });
    });
  });

  describe("Nested Panels", () => {
    describe("GIVEN the nested panel story", () => {
      describe("WHEN outer panel trigger is clicked", () => {
        it("THEN outer panel opens with correct content", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();

          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
          cy.findByText("Content of the right panel.").should("be.visible");
        });
      });

      describe("WHEN nested panel trigger is clicked inside outer panel", () => {
        it("THEN nested panel opens", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");

          cy.findByRole("button", { name: "Toggle nested panel" }).click();

          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );
          cy.findByText("This panel is nested inside the right panel.").should(
            "be.visible",
          );
          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
        });
      });

      describe("WHEN nested panel close button is clicked", () => {
        it("THEN nested panel closes but outer panel remains open", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");

          cy.findByRole("button", { name: "Toggle nested panel" }).click();
          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );

          cy.findByRole("region", { name: "Nested Panel" }).within(() => {
            cy.findByRole("button", { name: "Close" }).click();
          });

          cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
          cy.findByText("Content of the right panel.").should("be.visible");
        });
      });

      describe("WHEN outer panel close button is clicked while nested is open", () => {
        it("THEN both panels close", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("button", { name: "Toggle nested panel" }).click();

          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );

          cy.findByRole("region", { name: "Right Panel" })
            .find("button[aria-label='Close']")
            .not("[class*='saltSidePanelContent']")
            .first()
            .click();

          cy.findByRole("region", { name: "Right Panel" }).should("not.exist");
          cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
        });
      });

      describe("WHEN nested panel is opened and closed", () => {
        it("THEN it can be reopened", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();

          cy.findByRole("button", { name: "Toggle nested panel" }).click();
          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );

          cy.findByRole("region", { name: "Nested Panel" }).within(() => {
            cy.findByRole("button", { name: "Close" }).click();
          });
          cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");

          cy.findByRole("button", { name: "Toggle nested panel" }).click();
          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );
          cy.findByText("This panel is nested inside the right panel.").should(
            "be.visible",
          );
        });
      });

      describe("WHEN Escape is pressed while nested panel is focused", () => {
        it("THEN nested panel closes but outer remains", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("button", { name: "Toggle nested panel" }).click();

          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );

          cy.findByRole("region", { name: "Nested Panel" }).within(() => {
            cy.findByRole("button", { name: "Close" }).focus();
          });
          cy.realPress("Escape");

          cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
        });
      });

      describe("WHEN outer panel is closed and reopened", () => {
        it("THEN nested panel state resets to closed", () => {
          cy.mount(<Nested />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("button", { name: "Toggle nested panel" }).click();
          cy.findByRole("region", { name: "Nested Panel" }).should(
            "be.visible",
          );

          cy.findByRole("region", { name: "Right Panel" })
            .find("button[aria-label='Close']")
            .first()
            .click();
          cy.findByRole("region", { name: "Right Panel" }).should("not.exist");

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
          cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
          cy.findByRole("button", { name: "Toggle nested panel" }).should(
            "be.visible",
          );
        });
      });
    });
  });

  describe("Scrollable", () => {
    describe("GIVEN default and scrollable panel stories", () => {
      describe("WHEN panel content scrollability differs", () => {
        it("THEN body focusability attributes match configuration", () => {
          cy.mount(<Default />);

          cy.findByRole("button", { name: "Open right panel" }).click();

          cy.get(".saltSidePanelContent-body").should("be.visible");
          cy.get(".saltSidePanelContent-body").should(
            "not.have.attr",
            "tabindex",
          );
          cy.get(".saltSidePanelContent-body").should("not.have.attr", "role");

          cy.mount(<Scrollable />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();

          cy.get(".saltSidePanelContent-body")
            .should("be.visible")
            .and("have.attr", "tabindex", "0")
            .and("have.attr", "role", "region");
        });
      });

      describe("WHEN scrollable panel is opened and closed", () => {
        it("THEN focus, visibility, and toggle behavior are correct", () => {
          cy.mount(<Scrollable />);

          cy.findByRole("button", { name: "Toggle right panel" }).click();

          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );
          cy.findByRole("region", { name: "Main content" }).should(
            "be.visible",
          );

          cy.findByRole("button", { name: "Close" }).should("have.focus");

          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "not.exist",
          );

          cy.findByRole("button", { name: "Toggle right panel" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );
        });
      });
    });
  });

  describe("WithNav", () => {
    describe("GIVEN the side panel with navigation story", () => {
      describe("WHEN panel is opened and then closed", () => {
        it("THEN nav remains visible throughout", () => {
          cy.mount(<WithNav />);

          cy.findByRole("button", { name: "Open side panel" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "be.visible",
          );
          cy.findByRole("navigation").should("be.visible");

          cy.findByRole("button", { name: "Close" }).click();
          cy.findByRole("region", { name: "Section Title" }).should(
            "not.exist",
          );
          cy.findByRole("navigation").should("be.visible");
        });
      });
    });
  });
});
