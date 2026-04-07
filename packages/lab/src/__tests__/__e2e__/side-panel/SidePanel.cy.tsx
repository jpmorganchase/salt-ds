import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";
import { useState } from "react";

const { Left, Default, ManualTrigger, Variants, WithTable } =
  composeStories(sidePanel);

describe("GIVEN a SidePanel component", () => {
  describe("Rendering & Position Variants", () => {
    it("WHEN Left panel is opened, THEN displays correctly with ARIA attributes", () => {
      cy.mount(<Left />);

      cy.findByRole("button", { name: "Open Left Panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Open Left Panel" }).click();
      cy.findByRole("button", { name: "Open Left Panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region").should("have.class", "saltSidePanel-left");

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("button", { name: "Open Left Panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("region").should("not.exist");
    });

    it("WHEN Default panel is opened, THEN displays with correct position class and ARIA attributes", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open Default Panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Open Default Panel" }).click();
      cy.findByRole("button", { name: "Open Default Panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("region")
        .should("have.class", "saltSidePanel-right")
        .and("be.visible");

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("button", { name: "Open Default Panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("region").should("not.exist");
    });

    it("WHEN ManualTrigger is used, THEN aria-expanded and aria-controls are managed correctly", () => {
      cy.mount(<ManualTrigger />);

      cy.findByRole("button", { name: "Open Manual Panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Open Manual Panel" }).click();

      cy.findByRole("button", { name: "Open Manual Panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
    });
  });

  describe("State Management", () => {
    describe("WHEN mounted as an uncontrolled component", () => {
      it("AND panel closes via button or Escape and reopens, THEN maintains state correctly", () => {
        cy.mount(<Left />);

        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");

        cy.findByRole("button", { name: "Close" }).click();
        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");

        cy.realPress("Escape");
        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
        cy.findByRole("region").should("have.attr", "role", "region");
      });

      it("AND trigger is activated by keyboard, THEN it toggles open and close", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).focus();
        cy.realPress("Enter");

        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
        cy.findByRole("button", { name: "Open Left Panel" }).should(
          "have.attr",
          "aria-expanded",
          "true",
        );

        cy.findByRole("button", { name: "Open Left Panel" }).focus();
        cy.realPress("Enter");

        cy.findByRole("region", { name: "Section Title" }).should("not.exist");
        cy.findByRole("button", { name: "Open Left Panel" }).should(
          "have.attr",
          "aria-expanded",
          "false",
        );
      });
    });

    describe("WHEN mounted as a controlled component", () => {
      it("AND using manual trigger with onOpenChange, THEN callback fires with correct value", () => {
        const onOpenChange = cy.stub().as("onOpenChange");

        cy.mount(
          <>
            <SidePanel
              open={false}
              onOpenChange={onOpenChange}
              aria-label="Controlled Test"
            >
              Content
            </SidePanel>
            <button onClick={() => onOpenChange(true)}>Open Panel</button>
          </>,
        );

        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Panel" }).click();

        cy.get("@onOpenChange").should("have.been.calledWith", true);
      });

      it("AND panel onOpenChange is called with false on Escape", () => {
        const onOpenChange = cy.stub().as("onOpenChange");

        cy.mount(
          <SidePanel
            open={true}
            onOpenChange={onOpenChange}
            aria-label="Test Panel"
          >
            Content
          </SidePanel>,
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

        cy.findByRole("button", { name: "Open Left Panel" })
          .invoke("attr", "aria-controls")
          .then((panelId) => {
            cy.findByRole("button", { name: "Open Left Panel" }).click();

            cy.findByRole("region").should("have.attr", "id", panelId);
          });
      });

      it("AND panel uses aria-label, THEN label is accessible via role query", () => {
        cy.mount(
          <SidePanel
            open={true}
            onOpenChange={() => {}}
            aria-label="Test Panel"
          >
            Content
          </SidePanel>,
        );

        cy.findByRole("region", { name: "Test Panel" })
          .should("be.visible")
          .and("have.attr", "aria-label", "Test Panel");
      });
    });
  });

  describe("Focus Management", () => {
    describe("WHEN panel is opened via trigger", () => {
      it("THEN initial focus moves to first button", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();

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

      it("AND user tabs through content and presses Escape, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress("Tab");
        cy.findByRole("region").should("be.visible");

        cy.realPress("Tab");
        cy.findByRole("region").should("be.visible");

        cy.realPress("Tab");
        cy.findByRole("region").should("be.visible");

        cy.realPress("Escape");

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open Left Panel");
      });

      it("AND user navigates to form field and closes, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();

        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress("Tab");
        cy.realPress("Tab");

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open Left Panel");
      });

      it("AND Shift+Tab from first panel interactive moves focus back to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("button", { name: "Close" }).should("have.focus");

        cy.realPress(["Shift", "Tab"]);

        cy.findByRole("button", { name: "Open Left Panel" }).should(
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
    });

    describe("WHEN multiple panels are open simultaneously", () => {
      it("AND Escape is pressed in each panel sequentially, THEN each closes and focus returns to its trigger", () => {
        cy.mount(<Variants />);

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
          cy.findAllByRole("textbox").first().focus();
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
          cy.findAllByRole("textbox").first().focus();
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
          cy.findAllByRole("textbox").first().focus();
        });
        cy.realPress("Escape");
        cy.findByRole("region", { name: "Tertiary Variant" }).should(
          "not.exist",
        );
        cy.focused().should("have.text", "Toggle Tertiary Panel");
      });

      it("AND trigger is clicked while another panel focused, THEN focus returns to its trigger", () => {
        cy.mount(<Variants />);

        cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
        cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

        cy.findByRole("region", { name: "Primary Variant" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "be.visible",
        );

        cy.findByRole("region", { name: "Secondary Variant" }).within(() => {
          cy.findAllByRole("textbox").first().focus();
        });

        cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "not.exist",
        );
        cy.findByRole("region", { name: "Primary Variant" }).should(
          "be.visible",
        );

        cy.focused().should("have.text", "Toggle Secondary Panel");
      });
    });
  });

  describe("Variants", () => {
    it("WHEN variant panels are toggled, THEN each renders with correct style class", () => {
      cy.mount(<Variants />);

      cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
      cy.findByRole("region", { name: "Primary Variant" })
        .should("be.visible")
        .and("have.class", "saltSidePanel-primary");
      cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
      cy.findByRole("region", { name: "Primary Variant" }).should("not.exist");

      cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();
      cy.findByRole("region", { name: "Secondary Variant" })
        .should("be.visible")
        .and("have.class", "saltSidePanel-secondary");
      cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();
      cy.findByRole("region", { name: "Secondary Variant" }).should(
        "not.exist",
      );

      cy.findByRole("button", { name: "Toggle Tertiary Panel" }).click();
      cy.findByRole("region", { name: "Tertiary Variant" })
        .should("be.visible")
        .and("have.class", "saltSidePanel-tertiary");
      cy.findByRole("button", { name: "Toggle Tertiary Panel" }).click();
      cy.findByRole("region", { name: "Tertiary Variant" }).should("not.exist");
    });

    it("AND all variants are toggled sequentially, THEN each maintains independent state", () => {
      cy.mount(<Variants />);

      cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
      cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();
      cy.findByRole("button", { name: "Toggle Tertiary Panel" }).click();

      cy.findByRole("region", { name: "Primary Variant" }).should("be.visible");
      cy.findByRole("region", { name: "Secondary Variant" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Tertiary Variant" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

      cy.findByRole("region", { name: "Secondary Variant" }).should(
        "not.exist",
      );
      cy.findByRole("region", { name: "Primary Variant" }).should("be.visible");
      cy.findByRole("region", { name: "Tertiary Variant" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Toggle Primary Panel" }).click();

      cy.findByRole("region", { name: "Primary Variant" }).should("not.exist");
      cy.findByRole("region", { name: "Tertiary Variant" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Toggle Tertiary Panel" }).click();

      cy.findByRole("region", { name: "Tertiary Variant" }).should("not.exist");
    });
  });

  it("WHEN table row View Details button is clicked, THEN panel opens with correct employee details", () => {
    cy.mount(<WithTable />);

    cy.findByRole("table").should("be.visible");
    cy.findByRole("columnheader", { name: "Name" }).should("be.visible");

    cy.findAllByRole("button", { name: "View Details" }).first().click();

    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");
    cy.findByRole("region", { name: "Employee Details" }).within(() => {
      cy.findByText("Alice Johnson").should("be.visible");
      cy.findByText("alice.johnson@example.com").should("be.visible");
      cy.findByText("Engineering").should("be.visible");
    });
  });

  it("WHEN panel is open and Close button clicked, THEN panel is removed and table remains visible", () => {
    cy.mount(<WithTable />);

    cy.findAllByRole("button", { name: "View Details" }).first().click();

    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");

    cy.findByRole("button", { name: "Close" }).click();

    cy.findByRole("region", { name: "Employee Details" }).should("not.exist");
    cy.findByRole("table").should("be.visible");
  });

  it("WHEN different rows are clicked sequentially, THEN panel content updates with new employee data", () => {
    cy.mount(<WithTable />);

    cy.findAllByRole("button", { name: "View Details" }).first().click();

    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");
    cy.findByRole("region", { name: "Employee Details" }).within(() => {
      cy.findByText("Alice Johnson").should("be.visible");
    });

    cy.findByRole("button", { name: "Close" }).click();

    cy.findByRole("region", { name: "Employee Details" }).should("not.exist");

    cy.findAllByRole("button", { name: "View Details" }).eq(2).click();

    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");
    cy.findByRole("region", { name: "Employee Details" }).within(() => {
      cy.findByText("Carol Williams").should("be.visible");
      cy.findByText("Product").should("be.visible");
    });
  });

  it("WHEN panel is open and Escape is pressed, THEN panel closes and onOpenChange fires", () => {
    const onOpenChange = cy.stub().as("onOpenChange");

    cy.mount(
      <>
        <SidePanel
          open={true}
          onOpenChange={onOpenChange}
          aria-label="Table Test"
        >
          Employee Details
        </SidePanel>
        <table>
          <tbody>
            <tr>
              <td>Test Row</td>
            </tr>
          </tbody>
        </table>
      </>,
    );

    cy.findByRole("region", { name: "Table Test" })
      .should("be.visible")
      .focus();

    cy.realPress("Escape");

    cy.get("@onOpenChange").should("have.been.calledWith", false);
  });

  it("WHEN different View Details buttons clicked sequentially, THEN aria-expanded moves to active trigger only", () => {
    cy.mount(<WithTable />);

    cy.findAllByRole("button", { name: "View Details" })
      .eq(0)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(1)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(2)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(3)
      .should("have.attr", "aria-expanded", "false");

    cy.findAllByRole("button", { name: "View Details" }).eq(0).click();
    cy.findAllByRole("button", { name: "View Details" })
      .eq(0)
      .should("have.attr", "aria-expanded", "true");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(1)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(2)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(3)
      .should("have.attr", "aria-expanded", "false");

    cy.findAllByRole("button", { name: "View Details" }).eq(2).click();
    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");
    cy.findByRole("region", { name: "Employee Details" }).within(() => {
      cy.findByText("Carol Williams").should("be.visible");
    });
    cy.findAllByRole("button", { name: "View Details" })
      .eq(0)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(2)
      .should("have.attr", "aria-expanded", "true");

    cy.findByRole("button", { name: "Close" }).click();
    cy.findAllByRole("button", { name: "View Details" })
      .eq(0)
      .should("have.attr", "aria-expanded", "false");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(2)
      .should("have.attr", "aria-expanded", "false");
  });

  it("AND different row triggers are clicked while panel is open, THEN content updates in-place and focus moves into panel", () => {
    cy.mount(<WithTable />);

    cy.findAllByRole("button", { name: "View Details" }).eq(0).click();
    cy.findByRole("region", { name: "Employee Details" })
      .should("be.visible")
      .as("employeePanel")
      .invoke("attr", "id")
      .as("employeePanelId");

    cy.findByText("Alice Johnson").should("be.visible");
    cy.findByRole("button", { name: "Close" }).should("have.focus");

    cy.findAllByRole("button", { name: "View Details" }).eq(2).click();

    cy.get("@employeePanel").should("be.visible");
    cy.get<string>("@employeePanelId").then((panelId) => {
      cy.findByRole("region", { name: "Employee Details" }).should(
        "have.attr",
        "id",
        panelId,
      );
    });
    cy.findByText("Carol Williams").should("be.visible");
    cy.findByRole("button", { name: "Close" }).should("have.focus");
  });

  it("AND same row trigger is clicked again while open, THEN panel closes as toggle behavior", () => {
    cy.mount(<WithTable />);

    cy.findAllByRole("button", { name: "View Details" }).eq(0).click();
    cy.findByRole("region", { name: "Employee Details" }).should("be.visible");

    cy.findAllByRole("button", { name: "View Details" }).eq(0).click();

    cy.findByRole("region", { name: "Employee Details" }).should("not.exist");
    cy.findAllByRole("button", { name: "View Details" })
      .eq(0)
      .should("have.attr", "aria-expanded", "false")
      .and("have.focus");
  });
});
