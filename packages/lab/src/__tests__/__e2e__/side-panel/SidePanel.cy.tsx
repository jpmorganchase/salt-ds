import { SidePanel } from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";

const { Left, Right, ManualTrigger, Variants, WithTable } =
  composeStories(sidePanel);

describe("GIVEN a SidePanel component", () => {
  describe("Rendering & Position Variants", () => {
    it("WHEN Left panel is opened, THEN displays with correct position class", () => {
      cy.mount(<Left />);

      cy.findByRole("button", { name: "Open Left Panel" }).click();

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region").should("have.class", "saltSidePanel-left");

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region").should("not.exist");
    });

    it("WHEN Right panel is opened, THEN displays with correct position class", () => {
      cy.mount(<Right />);

      cy.findByRole("button", { name: "Open Right Panel" }).click();

      cy.findByRole("region")
        .should("have.class", "saltSidePanel-right")
        .and("be.visible");

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region").should("not.exist");
    });
  });

  describe("State Management", () => {
    describe("WHEN mounted as an uncontrolled component", () => {
      it("AND trigger clicked, THEN panel opens and closes correctly", () => {
        cy.mount(<Left />);

        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");

        cy.findByRole("button", { name: "Close" }).click();
        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      });

      it("AND panel is closed via Escape and trigger clicked again, THEN panel re-opens fresh", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");

        cy.realPress("Escape");
        cy.findByRole("region").should("not.exist");

        cy.findByRole("button", { name: "Open Left Panel" }).click();
        cy.findByRole("region", { name: "Section Title" }).should("be.visible");
        cy.findByRole("region").should("have.attr", "role", "region");
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
    });
  });

  describe("Focus Management", () => {
    describe("WHEN panel is opened via trigger", () => {
      it("THEN initial focus moves to first button", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();

        cy.focused().should("have.text", "Close");
      });

      it("AND user tabs through content and presses Escape, THEN panel closes and focus returns to trigger", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).click();

        cy.focused().should("have.text", "Close");

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

        cy.focused().should("have.text", "Close");

        cy.realPress("Tab");
        cy.realPress("Tab");

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("region").should("not.exist");
        cy.focused().should("have.text", "Open Left Panel");
      });
    });

    describe("WHEN multiple panels are open simultaneously", () => {
      it("AND Escape is pressed in focused panel, THEN only that panel closes and focus returns to its trigger", () => {
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
      });

      it("AND Escape is pressed in each panel sequentially, THEN each closes with correct focus return", () => {
        cy.mount(<Variants />);

        cy.findByRole("button", { name: "Toggle Primary Panel" }).click();
        cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();
        cy.findByRole("button", { name: "Toggle Tertiary Panel" }).click();

        cy.findByRole("region", { name: "Secondary Variant" }).within(() => {
          cy.findAllByRole("textbox").first().focus();
        });

        cy.realPress("Escape");

        cy.findByRole("region", { name: "Secondary Variant" }).should(
          "not.exist",
        );
        cy.focused().should("have.text", "Toggle Secondary Panel");

        cy.findByRole("region", { name: "Primary Variant" }).within(() => {
          cy.findAllByRole("textbox").first().focus();
        });

        cy.realPress("Escape");

        cy.findByRole("region", { name: "Primary Variant" }).should(
          "not.exist",
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

  describe("Accessibility (ARIA)", () => {
    describe("WHEN using SidePanelGroup with auto-managed ARIA", () => {
      it("THEN aria-expanded and aria-controls are set before panel opens", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" })
          .should("have.attr", "aria-expanded", "false")
          .and("have.attr", "aria-controls");
      });

      it("AND panel is opened, THEN aria-expanded is true and aria-controls matches panel id", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" })
          .invoke("attr", "aria-controls")
          .then((panelId) => {
            cy.findByRole("button", { name: "Open Left Panel" }).click();

            cy.findByRole("button", { name: "Open Left Panel" }).should(
              "have.attr",
              "aria-expanded",
              "true",
            );

            cy.findByRole("region").should("have.attr", "id", panelId);
          });
      });

      it("AND panel is opened then closed, THEN aria-expanded toggles correctly", () => {
        cy.mount(<Left />);

        cy.findByRole("button", { name: "Open Left Panel" }).should(
          "have.attr",
          "aria-expanded",
          "false",
        );

        cy.findByRole("button", { name: "Open Left Panel" }).click();

        cy.findByRole("button", { name: "Open Left Panel" }).should(
          "have.attr",
          "aria-expanded",
          "true",
        );

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("button", { name: "Open Left Panel" }).should(
          "have.attr",
          "aria-expanded",
          "false",
        );
      });
    });

    describe("WHEN using manual trigger outside SidePanelGroup", () => {
      it("THEN aria-expanded and aria-controls are user-provided", () => {
        cy.mount(<ManualTrigger />);

        cy.findByRole("button", { name: "Open Manual Panel" })
          .should("have.attr", "aria-expanded", "false")
          .and("have.attr", "aria-controls");
      });

      it("AND trigger is clicked, THEN aria-expanded updates", () => {
        cy.mount(<ManualTrigger />);

        cy.findByRole("button", { name: "Open Manual Panel" }).click();

        cy.findByRole("button", { name: "Open Manual Panel" }).should(
          "have.attr",
          "aria-expanded",
          "true",
        );
      });
    });

    describe("WHEN panel uses aria-label", () => {
      it("THEN label is accessible via role query", () => {
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

  describe("Style Variants", () => {
    it("WHEN Variants story has Primary panel toggled, THEN renders with primary class", () => {
      cy.mount(<Variants />);

      cy.findByRole("button", { name: "Toggle Primary Panel" }).click();

      cy.findByRole("region", { name: "Primary Variant" })
        .should("be.visible")
        .and("have.class", "saltSidePanel-primary");

      cy.findByRole("button", { name: "Toggle Primary Panel" }).click();

      cy.findByRole("region", { name: "Primary Variant" }).should("not.exist");
    });

    it("WHEN Variants story has Secondary panel toggled, THEN renders with secondary class", () => {
      cy.mount(<Variants />);

      cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

      cy.findByRole("region", { name: "Secondary Variant" })
        .should("be.visible")
        .and("have.class", "saltSidePanel-secondary");

      cy.findByRole("button", { name: "Toggle Secondary Panel" }).click();

      cy.findByRole("region", { name: "Secondary Variant" }).should(
        "not.exist",
      );
    });

    it("WHEN Variants story has Tertiary panel toggled, THEN renders with tertiary class", () => {
      cy.mount(<Variants />);

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

  describe("Integration: Real-world E2E", () => {
    it("WHEN table row View Details button is clicked, THEN panel opens with correct employee details", () => {
      cy.mount(<WithTable />);

      cy.findByRole("table").should("be.visible");
      cy.findByRole("columnheader", { name: "Name" }).should("be.visible");

      cy.findAllByRole("button", { name: "View Details" }).first().click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByText("Alice Johnson").should("be.visible");
        cy.findByText("alice.johnson@example.com").should("be.visible");
        cy.findByText("Engineering").should("be.visible");
      });
    });

    it("WHEN panel is open and Close button clicked, THEN panel is removed and table remains visible", () => {
      cy.mount(<WithTable />);

      cy.findAllByRole("button", { name: "View Details" }).first().click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");
      cy.findByRole("table").should("be.visible");
    });

    it("WHEN different rows are clicked sequentially, THEN panel content updates with new employee data", () => {
      cy.mount(<WithTable />);

      cy.findAllByRole("button", { name: "View Details" }).first().click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByText("Alice Johnson").should("be.visible");
      });

      cy.findByRole("button", { name: "Close" }).click();

      cy.findByRole("region", { name: "Employee Details" }).should("not.exist");

      cy.findAllByRole("button", { name: "View Details" }).eq(2).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
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

    it("AND multiple employee rows are viewed in sequence, THEN panel content updates each time", () => {
      cy.mount(<WithTable />);

      const scenarios = [
        { index: 0, name: "Alice Johnson", dept: "Engineering" },
        { index: 1, name: "Bob Smith", dept: "Design" },
        { index: 3, name: "David Brown", dept: "Sales" },
      ];

      scenarios.forEach(({ index, name, dept }) => {
        cy.findAllByRole("button", { name: "View Details" }).eq(index).click();

        cy.findByRole("region", { name: "Employee Details" }).should(
          "be.visible",
        );
        cy.findByRole("region", { name: "Employee Details" }).within(() => {
          cy.findByText(name).should("be.visible");
          cy.findByText(dept).should("be.visible");
        });

        cy.findByRole("button", { name: "Close" }).click();

        cy.findByRole("region", { name: "Employee Details" }).should(
          "not.exist",
        );
      });
    });

    it("AND a different View Details button is clicked while panel is open, THEN active aria-expanded moves to the new trigger", () => {
      cy.mount(<WithTable />);

      cy.findAllByRole("button", { name: "View Details" }).eq(0).click();

      cy.findAllByRole("button", { name: "View Details" })
        .eq(0)
        .should("have.attr", "aria-expanded", "true");
      cy.findAllByRole("button", { name: "View Details" })
        .eq(2)
        .should("have.attr", "aria-expanded", "false");

      cy.findAllByRole("button", { name: "View Details" }).eq(2).click();

      cy.findByRole("region", { name: "Employee Details" }).should(
        "be.visible",
      );
      cy.findByRole("region", { name: "Employee Details" }).within(() => {
        cy.findByText("Carol Williams").should("be.visible");
      });

      cy.findAllByRole("button", { name: "View Details" })
        .eq(0)
        .should("have.attr", "aria-expanded", "false");
      cy.findAllByRole("button", { name: "View Details" })
        .eq(2)
        .should("have.attr", "aria-expanded", "true");
    });

    it("WHEN multiple View Details buttons exist and panel is opened by different rows, THEN only active trigger has aria-expanded true", () => {
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

      cy.findByRole("button", { name: "Close" }).click();

      cy.findAllByRole("button", { name: "View Details" })
        .eq(0)
        .should("have.attr", "aria-expanded", "false");
      cy.findAllByRole("button", { name: "View Details" })
        .eq(1)
        .should("have.attr", "aria-expanded", "false");

      cy.findAllByRole("button", { name: "View Details" }).eq(2).click();

      cy.findAllByRole("button", { name: "View Details" })
        .eq(0)
        .should("have.attr", "aria-expanded", "false");
      cy.findAllByRole("button", { name: "View Details" })
        .eq(1)
        .should("have.attr", "aria-expanded", "false");
      cy.findAllByRole("button", { name: "View Details" })
        .eq(2)
        .should("have.attr", "aria-expanded", "true");
      cy.findAllByRole("button", { name: "View Details" })
        .eq(3)
        .should("have.attr", "aria-expanded", "false");

      cy.findByRole("button", { name: "Close" }).click();

      cy.findAllByRole("button", { name: "View Details" })
        .eq(2)
        .should("have.attr", "aria-expanded", "false");
    });
  });
});
