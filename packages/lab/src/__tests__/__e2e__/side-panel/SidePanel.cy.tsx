import { SidePanel, SidePanelProvider, SidePanelTrigger } from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";

const { Left, Default, ManualTrigger, Variants, WithTable, Nested } =
  composeStories(sidePanel);

describe("GIVEN a SidePanel component", () => {
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

      // Open the panel (default is primary)
      cy.findByRole("button", { name: "Open right panel" }).click();
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

      cy.findByRole("button", { name: "Open right panel" }).click();
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

    it("WHEN panel is open and Escape is pressed, THEN panel closes and onOpenChange fires", () => {
      const onOpenChange = cy.stub().as("onOpenChange");

      cy.mount(
        <SidePanelProvider open={true} onOpenChange={onOpenChange}>
          <SidePanel aria-label="Table Test">Employee Details</SidePanel>
          <table>
            <tbody>
              <tr>
                <td>Test Row</td>
              </tr>
            </tbody>
          </table>
        </SidePanelProvider>,
      );

      cy.findByRole("region", { name: "Table Test" })
        .should("be.visible")
        .focus();

      cy.realPress("Escape");

      cy.get("@onOpenChange").should("have.been.calledWith", false);
    });

    it("AND multiple employee rows are viewed in sequence, THEN panel content updates each time", () => {
      cy.mount(<WithTable />);

      const scenarios = [
        { name: "Alex Morgan", email: "alex.morgan@example.com" },
        { name: "Taylor Reed", email: "taylor.reed@example.com" },
        { name: "Casey Patel", email: "casey.patel@example.com" },
      ];

      scenarios.forEach(({ name, email }) => {
        cy.findByRole("button", {
          name: `Edit details for ${name}`,
        }).click();

        cy.findByRole("region", { name: "Employee Details" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Employee Details" }).within(() => {
          cy.findByDisplayValue(name).should("be.visible");
          cy.findByDisplayValue(email).should("be.visible");
        });

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("region", { name: "Employee Details" }).should(
          "not.exist",
        );
      });
    });

    it("WHEN different Edit buttons clicked sequentially, THEN aria-expanded moves to active trigger only", () => {
      cy.mount(<WithTable />);

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.findByRole("button", {
        name: "Edit details for Taylor Reed",
      }).should("have.attr", "aria-expanded", "false");

      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).click();
      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("button", {
        name: "Edit details for Taylor Reed",
      }).should("have.attr", "aria-expanded", "false");

      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).click();
      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByDisplayValue("Jordan Lee").should("be.visible");
      });
      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).should("have.attr", "aria-expanded", "true");

      cy.findByRole("button", { name: "Close" }).click();
      cy.findByRole("button", { name: "Edit details for Alex Morgan" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.findByRole("button", {
        name: "Edit details for Jordan Lee",
      }).should("have.attr", "aria-expanded", "false");
    });
  });

  describe("Nested Panels", () => {
    it("WHEN outer panel trigger is clicked, THEN outer panel opens with correct content", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Open Outer Panel" })
        .should("have.attr", "aria-expanded", "false")
        .and("have.attr", "aria-controls");

      cy.findByRole("button", { name: "Open Outer Panel" }).click();

      cy.findByRole("button", { name: "Open Outer Panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");
      cy.findByText("Content of the outer panel.").should("be.visible");
    });

    it("WHEN nested panel trigger is clicked inside outer panel, THEN nested panel opens", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Open Outer Panel" }).click();
      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");

      cy.findByRole("button", { name: "Open Nested Panel" }).click();

      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");
      cy.findByText("This panel is nested inside the right panel.").should(
        "be.visible",
      );
      // Outer panel should still be visible
      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");
    });

    it("WHEN nested panel close button is clicked, THEN nested panel closes but outer panel remains open", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Open Outer Panel" }).click();
      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");

      cy.findByRole("button", { name: "Open Nested Panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      cy.findByRole("button", { name: "Close nested" }).click();

      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");
      cy.findByText("Content of the outer panel.").should("be.visible");
    });

    it("WHEN outer panel close button is clicked while nested is open, THEN both panels close", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Open Outer Panel" }).click();
      cy.findByRole("button", { name: "Open Nested Panel" }).click();

      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      cy.findByRole("button", { name: "Close outer" }).click();

      cy.findByRole("region", { name: "Outer Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");

      cy.findByRole("button", { name: "Open Outer Panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
    });

    it("WHEN nested panel is opened and closed, THEN it can be reopened", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Open Outer Panel" }).click();

      // Open nested panel
      cy.findByRole("button", { name: "Open Nested Panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // Close nested panel
      cy.findByRole("button", { name: "Close nested" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");

      // Reopen nested panel
      cy.findByRole("button", { name: "Open Nested Panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");
      cy.findByText("This panel is nested inside the right panel.").should(
        "be.visible",
      );
    });

    it("WHEN Escape is pressed while nested panel is focused, THEN nested panel closes but outer remains", () => {
      cy.mount(<Nested />);

      cy.findByRole("button", { name: "Open Outer Panel" }).click();
      cy.findByRole("button", { name: "Open Nested Panel" }).click();

      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // Focus inside nested panel and press Escape
      cy.findByRole("button", { name: "Close nested" }).focus();
      cy.realPress("Escape");

      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");
    });

    it("WHEN outer panel is closed and reopened, THEN nested panel state resets to closed", () => {
      cy.mount(<Nested />);

      // Open outer, open nested
      cy.findByRole("button", { name: "Open Outer Panel" }).click();
      cy.findByRole("button", { name: "Open Nested Panel" }).click();
      cy.findByRole("region", { name: "Nested Panel" }).should("be.visible");

      // Close outer panel (closes everything)
      cy.findByRole("button", { name: "Close outer" }).click();
      cy.findByRole("region", { name: "Outer Panel" }).should("not.exist");

      // Reopen outer panel — nested should not be open
      cy.findByRole("button", { name: "Open Outer Panel" }).click();
      cy.findByRole("region", { name: "Outer Panel" }).should("be.visible");
      cy.findByRole("region", { name: "Nested Panel" }).should("not.exist");
      cy.findByRole("button", { name: "Open Nested Panel" }).should(
        "be.visible",
      );
    });
  });
});
