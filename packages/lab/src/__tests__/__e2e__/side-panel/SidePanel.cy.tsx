import {
  SidePanel,
  SidePanelGroup,
  SidePanelProvider,
  SidePanelTrigger,
} from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { useRef, useState } from "react";

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

      cy.findByRole("button", { name: "Open left panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Open left panel" }).click();
      cy.findByRole("button", { name: "Close left panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

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

      cy.findByRole("button", { name: "Open right panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Open right panel" }).click();
      cy.findByRole("button", { name: "Close right panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("region")
        .should("have.class", "saltSidePanel-right")
        .and("be.visible");

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

      cy.findByRole("button", { name: "Toggle left panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Toggle left panel" }).click();

      cy.findByRole("button", { name: "Toggle left panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

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

      it("AND trigger is activated by keyboard while panel is open, THEN focus moves into panel", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open left panel" }).focus();
        cy.realPress("Enter");

        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
        cy.findByRole("button", { name: "Close left panel" }).should(
          "have.attr",
          "aria-expanded",
          "true",
        );

        // Shift+Tab returns focus to trigger — re-activating moves focus back in
        cy.findByRole("button", { name: "Close left panel" }).focus();
        cy.realPress("Enter");

        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
        cy.findByRole("button", { name: "Close left panel" }).should(
          "have.attr",
          "aria-expanded",
          "true",
        );
        cy.findByRole("button", { name: "Close" }).should("have.focus");
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

      it("AND panel closes programmatically, THEN focus returns to the trigger", () => {
        const ProgrammaticCloseExample = () => {
          const [open, setOpen] = useState(false);

          return (
            <SidePanelGroup open={open} onOpenChange={setOpen}>
              <SidePanelTrigger>
                <button type="button">Open Programmatic Panel</button>
              </SidePanelTrigger>
              <button type="button" onClick={() => setOpen(false)}>
                Programmatic Close
              </button>
              <SidePanel aria-label="Programmatic Panel">
                <button type="button">Inside Panel Action</button>
              </SidePanel>
            </SidePanelGroup>
          );
        };

        cy.mount(<ProgrammaticCloseExample />);

        cy.findByRole("button", { name: "Open Programmatic Panel" }).click();
        cy.findByRole("region", { name: "Programmatic Panel" }).should(
          "be.visible",
        );

        cy.findByRole("button", { name: "Programmatic Close" }).click();

        cy.findByRole("region", { name: "Programmatic Panel" }).should(
          "not.exist",
        );
        cy.findByRole("button", { name: "Open Programmatic Panel" }).should(
          "have.focus",
        );
      });
    });

    describe("WHEN checking ARIA attributes and accessibility", () => {
      it("THEN aria-controls attribute links button to panel id correctly", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open left panel" })
          .invoke("attr", "aria-controls")
          .then((panelId) => {
            cy.findByRole("button", { name: "Open left panel" }).click();

            cy.findByRole("region").should("have.attr", "id", panelId);
          });
      });

      it("AND panel uses aria-label, THEN label is accessible via role query", () => {
        cy.mount(
          <SidePanelProvider open>
            <SidePanel aria-label="Test Panel">Content</SidePanel>
          </SidePanelProvider>,
        );

        cy.findByRole("region", { name: "Test Panel" })
          .should("be.visible")
          .and("have.attr", "aria-label", "Test Panel");
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

      it("AND panel has no interactive content, THEN focus moves to panel region", () => {
        const NoInteractivePanelExample = () => (
          <SidePanelGroup>
            <SidePanelTrigger>
              <button type="button">Open Non-Interactive Panel</button>
            </SidePanelTrigger>
            <SidePanel aria-label="Read Only Panel">
              <p>Read only content without interactive elements.</p>
            </SidePanel>
          </SidePanelGroup>
        );

        cy.mount(<NoInteractivePanelExample />);

        cy.findByRole("button", { name: "Open Non-Interactive Panel" }).click();
        cy.findByRole("region", { name: "Read Only Panel" }).should(
          "have.focus",
        );
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

      it("AND user tabs through content and presses Escape, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open left panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress("Tab");
        cy.findByRole("region").should("be.visible");

        cy.realPress("Tab");
        cy.findByRole("region").should("be.visible");

        cy.realPress("Tab");
        cy.findByRole("region").should("be.visible");

        cy.realPress("Escape");

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open left panel");
      });

      it("AND user navigates to form field and closes, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open left panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress("Tab");
        cy.realPress("Tab");

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open left panel");
      });

      it("AND Shift+Tab from first panel interactive moves focus back to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open left panel" }).click();
        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress(["Shift", "Tab"]);

        cy.findByRole("button", { name: "Close left panel" }).should(
          "have.focus",
        );
      });

      it("AND panel is open, THEN focus is non-modal and can move out and back in logical order", () => {
        const NonModalFlowExample = () => (
          <>
            <button type="button">Before Trigger Control</button>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Open Non-Modal Panel</button>
              </SidePanelTrigger>
              <button type="button">After Trigger Control</button>
              <SidePanel aria-label="Non Modal Panel">
                <button type="button">Panel First Action</button>
                <button type="button">Panel Last Action</button>
              </SidePanel>
            </SidePanelGroup>
          </>
        );

        cy.mount(<NonModalFlowExample />);

        cy.findByRole("button", { name: "Open Non-Modal Panel" }).click();
        cy.findByRole("button", { name: "Panel First Action" }).should(
          "have.focus",
        );

        cy.realPress("Tab");
        cy.findByRole("button", { name: "Panel Last Action" }).should(
          "have.focus",
        );

        cy.realPress("Tab");
        cy.findByRole("button", { name: "After Trigger Control" }).should(
          "have.focus",
        );

        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("button", { name: "Open Non-Modal Panel" }).should(
          "have.focus",
        );

        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("button", { name: "Before Trigger Control" }).should(
          "have.focus",
        );
      });

      it("AND panel immediately follows trigger in DOM, THEN Tab from last element exits panel without looping", () => {
        const DirectFollowExample = () => (
          <>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Open Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Direct Follow Panel">
                <button type="button">Panel First</button>
                <button type="button">Panel Last</button>
              </SidePanel>
            </SidePanelGroup>
            <button type="button">After Panel</button>
          </>
        );

        cy.mount(<DirectFollowExample />);
        cy.findByRole("button", { name: "Open Panel" }).click();
        cy.findByRole("button", { name: "Panel First" }).should("have.focus");

        cy.realPress("Tab");
        cy.findByRole("button", { name: "Panel Last" }).should("have.focus");

        // Must NOT loop back to "Panel First" — that would be a focus trap
        cy.realPress("Tab");
        cy.findByRole("button", { name: "After Panel" }).should("have.focus");
      });

      it("AND panel immediately follows trigger in DOM, THEN Shift+Tab from element after panel skips panel and returns to trigger", () => {
        const DirectFollowExample = () => (
          <>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Open Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Direct Follow Panel">
                <button type="button">Panel First</button>
                <button type="button">Panel Last</button>
              </SidePanel>
            </SidePanelGroup>
            <button type="button">After Panel</button>
          </>
        );

        cy.mount(<DirectFollowExample />);
        cy.findByRole("button", { name: "Open Panel" }).click();
        cy.findByRole("button", { name: "Panel Last" }).focus();

        cy.realPress("Tab");
        cy.findByRole("button", { name: "After Panel" }).should("have.focus");

        // Shift+Tab from "After Panel" skips the panel entirely and returns
        // focus to the trigger. The panel is only reachable via trigger
        // activation, not via natural Tab/Shift+Tab navigation.
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("button", { name: "Open Panel" }).should("have.focus");
      });
    });

    describe("WHEN panel is open on initial page load (no user trigger)", () => {
      it("THEN focus should NOT move to any element inside the panel", () => {
        cy.mount(
          <>
            <button type="button">Outside Button</button>
            <SidePanel
              open={true}
              onOpenChange={() => {}}
              aria-label="Initially Open Panel"
            >
              <button type="button">First Panel Button</button>
              <button type="button">Last Panel Button</button>
            </SidePanel>
          </>,
        );

        cy.findByRole("region", { name: "Initially Open Panel" }).should(
          "be.visible",
        );

        cy.focused().should("not.exist");

        cy.findByRole("button", { name: "First Panel Button" }).should(
          "not.have.focus",
        );
        cy.findByRole("button", { name: "Last Panel Button" }).should(
          "not.have.focus",
        );
      });

      it("AND panel is open with no interactive content, THEN focus does NOT move to panel on page load", () => {
        cy.mount(
          <SidePanel
            open={true}
            onOpenChange={() => {}}
            aria-label="Read Only Initially Open"
          >
            <p>Static content only</p>
          </SidePanel>,
        );

        cy.findByRole("region", { name: "Read Only Initially Open" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Read Only Initially Open" }).should(
          "not.have.focus",
        );
      });

      it("AND SidePanel has a manual triggerRef but starts closed, THEN focus should NOT move to trigger on page load", () => {
        const ManualTriggerClosedExample = () => {
          const [open, setOpen] = useState(false);
          const triggerRef = useRef<HTMLButtonElement | null>(null);

          return (
            <>
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(true)}
              >
                Open Panel
              </button>
              <SidePanel
                open={open}
                onOpenChange={setOpen}
                aria-label="Manual Trigger Panel"
                triggerRef={triggerRef}
              >
                <button type="button">Panel Content</button>
              </SidePanel>
            </>
          );
        };

        cy.mount(<ManualTriggerClosedExample />);

        cy.findByRole("region").should("not.exist");
        cy.focused().should("not.exist");
        cy.findByRole("button", { name: "Open Panel" }).should(
          "not.have.focus",
        );
      });
    });

    describe("WHEN multiple panels are open simultaneously", () => {
      it("AND Escape is pressed in each panel sequentially, THEN each closes and focus returns to its trigger", () => {
        const MultiPanelExample = () => (
          <>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Toggle Primary Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Primary Variant">
                <input aria-label="Primary input" />
              </SidePanel>
            </SidePanelGroup>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Toggle Secondary Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Secondary Variant">
                <input aria-label="Secondary input" />
              </SidePanel>
            </SidePanelGroup>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Toggle Tertiary Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Tertiary Variant">
                <input aria-label="Tertiary input" />
              </SidePanel>
            </SidePanelGroup>
          </>
        );

        cy.mount(<MultiPanelExample />);

        cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
        cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();
        cy.findByRole("button", { name: "Toggle Tertiary Panel" }).click();

        cy.findByRole("region", { name: "Primary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Tertiary Variant" }).should(
          "be.visible",
        );

        cy.findByRole("region", { name: "Secondary Variant" }).within(() => {
          cy.findByRole("textbox").focus();
        });
        cy.realPress("Escape");
        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "not.exist",
        );
        cy.findByRole("region", { name: "Primary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Tertiary Variant" }).should(
          "be.visible",
        );
        cy.focused().should("have.text", "Toggle Secondary Panel");

        cy.findByRole("region", { name: "Primary Variant" }).within(() => {
          cy.findByRole("textbox").focus();
        });
        cy.realPress("Escape");
        cy.findByRole("region", { name: "Primary Variant" }).should(
          "not.exist",
        );
        cy.findByRole("region", { name: "Tertiary Variant" }).should(
          "be.visible",
        );
        cy.focused().should("have.text", "Toggle Primary Panel");

        cy.findByRole("region", { name: "Tertiary Variant" }).within(() => {
          cy.findByRole("textbox").focus();
        });
        cy.realPress("Escape");
        cy.findByRole("region", { name: "Tertiary Variant" }).should(
          "not.exist",
        );
        cy.focused().should("have.text", "Toggle Tertiary Panel");
      });

      it("AND trigger is clicked while another panel focused, THEN focus moves into that panel", () => {
        const MultiPanelExample = () => (
          <>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Toggle Primary Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Primary Variant">
                <button type="button">Close</button>
              </SidePanel>
            </SidePanelGroup>
            <SidePanelGroup>
              <SidePanelTrigger>
                <button type="button">Toggle Secondary Panel</button>
              </SidePanelTrigger>
              <SidePanel aria-label="Secondary Variant">
                <input aria-label="Secondary input" />
                <button type="button">Close</button>
              </SidePanel>
            </SidePanelGroup>
          </>
        );

        cy.mount(<MultiPanelExample />);

        cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
        cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

        cy.findByRole("region", { name: "Primary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "be.visible",
        );

        cy.findByRole("region", { name: "Secondary Variant" }).within(() => {
          cy.findByRole("textbox").focus();
        });

        cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

        // Panel stays open; focus moves back to first element in the panel
        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Primary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Secondary Variant" }).within(() => {
          cy.findByRole("textbox").should("have.focus");
        });
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

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Alex Morgan").should("be.visible");
        cy.findByDisplayValue("alex.morgan@example.com").should("be.visible");
        cy.findByDisplayValue("+1 212 555 0101").should("be.visible");
      });
    });

    it("WHEN panel is open and Close button clicked, THEN panel is removed and table remains visible", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");
      cy.findByRole("table").should("be.visible");
    });

    it("WHEN different rows are clicked sequentially, THEN panel content updates with new employee data", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Alex Morgan").should("be.visible");
      });

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Jordan Lee").should("be.visible");
        cy.findByDisplayValue("jordan.lee@example.com").should("be.visible");
      });
    });

    it("AND different row triggers are clicked while panel is open, THEN content updates in-place and focus moves into panel", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();
      cy.findByRole("region", { name: "Employee Details" })
        .should("be.visible")
        .as("employeePanel")
        .invoke("attr", "id")
        .as("employeePanelId");

      cy.get("@employeePanel")
        .findByDisplayValue("Alex Morgan")
        .should("be.visible");
      cy.findByRole("button", { name: "Close" }).should("have.focus");

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();

      cy.get("@employeePanel").should("be.visible");
      cy.get("@employeePanelId").then((panelId) => {
        cy.findByRole("region", { name: "Employee Details" }).should(
          "have.attr",
          "id",
          panelId,
        );
      });
      cy.get("@employeePanel")
        .findByDisplayValue("Jordan Lee")
        .should("be.visible");
      cy.findByRole("button", { name: "Close" }).should("have.focus");
    });

    it("AND same row trigger is clicked again while open, THEN focus moves into panel without closing", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();
      cy.findByRole("region", { name: "Employee Details" }).should("be.visible");

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should("be.visible");
      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("button", { name: "Close" }).should("have.focus");
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

      cy.findByRole("region", { name: "Nested Panel" }).within(() => {
        cy.findByRole("button", { name: "Close" }).click();
      });

      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
      cy.findByText("Content of the right panel.").should("be.visible");
    });

    it("WHEN Escape is pressed while nested panel is focused, THEN nested panel closes but outer remains", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("button", { name: "Toggle nested panel" }).click();

      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      cy.findByRole("region", { name: "Nested Panel" }).within(() => {
        cy.findByRole("button", { name: "Close" }).focus();
      });
      cy.realPress("Escape");

      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Right Panel" }).should("be.visible");
    });

    it("WHEN outer panel is closed and reopened, THEN nested panel state resets to closed", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("button", { name: "Toggle nested panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

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

  describe("Scrollable", () => {
    it("WHEN panel is opened, THEN both main content and panel content are visible", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region", { name: "Main content" }).should("be.visible");
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
name: "Close" }).should("have.focus");
  });

  it("AND same row trigger is clicked again while open, THEN focus moves into panel without closing", () => {
    cy.mount(<WithTable />);

    cy.findAllByRole("button", { name: "View Details" }).eq(0).click();
    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");

    cy.findAllByRole("button", { name: "View Details" }).eq(0).click();

    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(0)
      .should("have.attr", "aria-expanded", "true");
    cy.findByRole("button", { name: "Close" }).should("have.focus");
=======
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

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Alex Morgan").should("be.visible");
        cy.findByDisplayValue("alex.morgan@example.com").should("be.visible");
        cy.findByDisplayValue("+1 212 555 0101").should("be.visible");
      });
    });

    it("WHEN panel is open and Close button clicked, THEN panel is removed and table remains visible", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");
      cy.findByRole("table").should("be.visible");
    });

    it("WHEN different rows are clicked sequentially, THEN panel content updates with new employee data", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Alex Morgan").should("be.visible");
      });

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Jordan Lee").should("be.visible");
        cy.findByDisplayValue("jordan.lee@example.com").should("be.visible");
      });
    });

    it("WHEN Edit button is clicked, THEN panel opens and can be closed", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Alex Morgan").should("be.visible");
      });

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Jordan Lee").should("be.visible");
      });
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
    it("WHEN panel is opened, THEN both main content and panel content are visible", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region", { name: "Main content" }).should("be.visible");
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
>>>>>>> origin/create-inlaid-panel-polish
  });
});
