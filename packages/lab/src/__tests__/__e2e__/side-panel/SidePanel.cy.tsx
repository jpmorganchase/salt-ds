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
    it("WHEN Left panel is opened, THEN displays correctly with ARIA attributes", () => {
      cy.mount(<Left />);

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

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region").should("have.class", "saltSidePanel-left");

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("button", { name: "Open left panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("region").should("not.exist");
    });

    it("WHEN Default panel is opened, THEN displays with correct position class and ARIA attributes", () => {
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

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("button", { name: "Open right panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("region").should("not.exist");
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
    describe("WHEN mounted as an uncontrolled component", () => {
      it("AND panel closes via button or Escape and reopens, THEN maintains state correctly", () => {
        cy.mount(<Left />);

        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open left panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");

        cy.findByRole("button", { name: "Close" }).click();
        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open left panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");

        cy.realPress("Escape");
        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open left panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
        cy.findByRole("region").should("have.attr", "role", "region");
      });
    });

    describe("WHEN mounted as a controlled component", () => {
      it("AND using SidePanelProvider with controlled open, THEN callback fires with correct value", () => {
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

      it("AND panel onOpenChange is called with false on Escape", () => {
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

  describe("Focus Management", () => {
    describe("WHEN panel is opened via trigger", () => {
      it("THEN initial focus moves to first button inside the panel", () => {
        cy.mount(<Default />);

        cy.findByRole("button", { name: "Open right panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");
      });

      it("AND user presses Escape, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Default />);

        cy.findByRole("button", { name: "Open right panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress("Escape");

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open right panel");
      });

      it("AND Close button is clicked, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Default />);

        cy.findByRole("button", { name: "Open right panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open right panel");
      });
    });
  });

  describe("Variants", () => {
    it("WHEN variant is changed via radio buttons, THEN panel renders with correct style class", () => {
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
    });

    it("WHEN panel is closed and reopened, THEN variant is preserved", () => {
      cy.mount(<Variants />);

      // Panel starts open due to defaultOpen={true}
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");

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

  describe("WithTable", () => {
    it("WHEN table row Edit button is clicked, THEN panel opens with correct employee details", () => {
      cy.mount(<WithTable />);

      cy.findByRole("table").should("be.visible");
      cy.findByRole("columnheader", { name: "Name" }).should("be.visible");

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).within(
        () => {
          cy.findByDisplayValue("Alex Morgan").should("be.visible");
          cy.findByDisplayValue("alex.morgan@example.com").should("be.visible");
          cy.findByDisplayValue("+1 212 555 0101").should("be.visible");
        },
      );
    });

    it("WHEN panel is open and Close button clicked, THEN panel is removed and table remains visible", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "not.exist",
      );
      cy.findByRole("table").should("be.visible");
    });

    it("WHEN different rows are clicked sequentially, THEN panel content updates with new employee data", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).within(
        () => {
          cy.findByDisplayValue("Alex Morgan").should("be.visible");
        },
      );

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "not.exist",
      );

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();

      cy.findByRole("region", { name: "Jordan Lee Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Jordan Lee Employee Details" }).within(
        () => {
          cy.findByDisplayValue("Jordan Lee").should("be.visible");
          cy.findByDisplayValue("jordan.lee@example.com").should("be.visible");
        },
      );
    });

    it("WHEN Edit button is clicked, THEN panel opens and can be closed", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).within(
        () => {
          cy.findByDisplayValue("Alex Morgan").should("be.visible");
        },
      );

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Alex Morgan Employee Details" }).should(
        "not.exist",
      );

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();

      cy.findByRole("region", { name: "Jordan Lee Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Jordan Lee Employee Details" }).within(
        () => {
          cy.findByDisplayValue("Jordan Lee").should("be.visible");
        },
      );
    });
  });

  describe("Nested Panels", () => {
    it("WHEN outer panel trigger is clicked, THEN outer panel opens with correct content", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
      cy.findByText("Content of the right panel.").should("be.visible");
    });

    it("WHEN nested panel trigger is clicked inside outer panel, THEN nested panel opens", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");

      cy.findByRole("button", { name: "Toggle nested panel" }).click();

      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");
      cy.findByText("This panel is nested inside the right panel.").should(
        "be.visible",
      );
      // Outer panel should still be visible
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
    });

    it("WHEN nested panel close button is clicked, THEN nested panel closes but outer panel remains open", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");

      cy.findByRole("button", { name: "Toggle nested panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // SidePanelContent renders a close button with aria-label="Close"
      // The nested panel's close button is inside the nested panel region
      cy.findByRole("region", { name: "Nested Panel" }).within(() => {
        cy.findByRole("button", { name: "Close" }).click();
      });

      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
      cy.findByText("Content of the right panel.").should("be.visible");
    });

    it("WHEN outer panel close button is clicked while nested is open, THEN both panels close", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("button", { name: "Toggle nested panel" }).click();

      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // The outer panel's close button has aria-label="Close" (manual close in OuterPanel)
      // It's in the outer panel region but NOT in the nested panel region
      cy.findByRole("region", { name: "Right Panel" })
        .find("button[aria-label='Close']")
        .not("[class*='saltSidePanelContent']")
        .first()
        .click();

      cy.findByRole("region", { name: "Right Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
    });

    it("WHEN nested panel is opened and closed, THEN it can be reopened", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      // Open nested panel
      cy.findByRole("button", { name: "Toggle nested panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // Close nested panel
      cy.findByRole("region", { name: "Nested Panel" }).within(() => {
        cy.findByRole("button", { name: "Close" }).click();
      });
      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");

      // Reopen nested panel
      cy.findByRole("button", { name: "Toggle nested panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");
      cy.findByText("This panel is nested inside the right panel.").should(
        "be.visible",
      );
    });

    it("WHEN Escape is pressed while nested panel is focused, THEN nested panel closes but outer remains", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("button", { name: "Toggle nested panel" }).click();

      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // Focus inside nested panel and press Escape
      cy.findByRole("region", { name: "Nested Panel" }).within(() => {
        cy.findByRole("button", { name: "Close" }).focus();
      });
      cy.realPress("Escape");

      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
    });

    it("WHEN outer panel is closed and reopened, THEN nested panel state resets to closed", () => {
      cy.mount(<Nested />);

      // Open outer, open nested
      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("button", { name: "Toggle nested panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // Close outer panel (closes everything) via the outer panel's manual close button
      cy.findByRole("region", { name: "Right Panel" })
        .find("button[aria-label='Close']")
        .first()
        .click();
      cy.findByRole("region", { name: "Right Panel" }).should("not.exist");

      // Reopen outer panel — nested should not be open
      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("button", { name: "Toggle nested panel" }).should(
        "be.visible",
      );
    });
  });

  describe("Scrollable", () => {
    it("WHEN panel content is not scrollable, THEN content body is not focusable", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open right panel" }).click();

      cy.get(".saltSidePanelContent-body").should("be.visible");
      cy.get(".saltSidePanelContent-body").should("not.have.attr", "tabindex");
      cy.get(".saltSidePanelContent-body").should("not.have.attr", "role");
    });

    it("WHEN panel content is scrollable, THEN content body is focusable", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.get(".saltSidePanelContent-body")
        .should("be.visible")
        .and("have.attr", "tabindex", "0")
        .and("have.attr", "role", "region");
    });

    it("WHEN panel is opened, THEN both main content and panel content are visible", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region", { name: "Main content" }).should("be.visible");
    });

    it("WHEN scrollable panel is opened, THEN Close button receives initial focus", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.findByRole("button", { name: "Close" }).should("have.focus");
    });

    it("WHEN panel is opened and closed, THEN panel can be toggled", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("not.exist");
    });
  });

  describe("WithNav", () => {
    it("WHEN panel is opened, THEN panel and nav are both visible", () => {
      cy.mount(<WithNav />);

      cy.findByRole("button", { name: "Open side panel" }).click();

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("navigation").should("be.visible");
    });

    it("WHEN panel is closed, THEN nav remains visible", () => {
      cy.mount(<WithNav />);

      cy.findByRole("button", { name: "Open side panel" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("not.exist");
      cy.findByRole("navigation").should("be.visible");
    });
  });
});
