import { Button, Text } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
} from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";
import { useState } from "react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(sidePanel);
const { Left, Default, ManualTrigger, WithTable, Scrollable, WithNav } =
  composedStories;

function DynamicScrollablePanel() {
  const [expanded, setExpanded] = useState(false);
  const content = expanded
    ? Array.from({ length: 160 }, () => "Expanded content").join(" ")
    : "Short content";

  return (
    <SidePanelProvider defaultOpen>
      <div style={{ display: "flex", height: 240 }}>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Dynamic Panel</SidePanelTitle>
          </SidePanelHeader>
          <SidePanelContent>
            <Button onClick={() => setExpanded(true)}>Expand content</Button>
            <Text>{content}</Text>
          </SidePanelContent>
        </SidePanel>
      </div>
    </SidePanelProvider>
  );
}

function FocusOrderPanel() {
  return (
    <SidePanelProvider>
      <div>
        <Button>Before trigger</Button>
        <SidePanelTrigger>
          <Button>Open panel</Button>
        </SidePanelTrigger>
        <Button>After trigger</Button>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Focus Panel</SidePanelTitle>
            <SidePanelCloseButton />
          </SidePanelHeader>
          <SidePanelContent>
            <Button>Panel action</Button>
          </SidePanelContent>
        </SidePanel>
      </div>
    </SidePanelProvider>
  );
}

function NaturalTabOrderPanel() {
  return (
    <SidePanelProvider defaultOpen>
      <div>
        <SidePanelTrigger>
          <Button>Open panel</Button>
        </SidePanelTrigger>
        <Button>After trigger</Button>
        <Button>Later page action</Button>
        <SidePanel disableAnimation>
          <SidePanelHeader>
            <SidePanelTitle>Natural Order Panel</SidePanelTitle>
            <SidePanelCloseButton />
          </SidePanelHeader>
          <SidePanelContent>
            <Button>Panel action</Button>
          </SidePanelContent>
        </SidePanel>
        <Button>After panel</Button>
      </div>
    </SidePanelProvider>
  );
}

describe("GIVEN a SidePanel component", () => {
  checkAccessibility(composedStories);

  describe("Rendering & Position Variants", () => {
    it("Left story - WHEN opened and closed via button and Escape, THEN lifecycle and ARIA state are correct", () => {
      cy.mount(<Left />);

      cy.findByRole("region").should("not.exist");

      cy.findByRole("button", { name: "Open left panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("button", { name: "Open left panel" }).click();
      cy.findByRole("button", { name: "Open left panel" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

      cy.findByRole("region", { name: "Section Title" })
        .invoke("attr", "id")
        .then((panelId) => {
          cy.findByRole("button", { name: "Open left panel" }).should(
            "have.attr",
            "aria-controls",
            panelId,
          );
        });

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region").should("have.class", "saltSidePanel-left");

      cy.findByRole("button", { name: "Close Section Title" }).click();
      cy.findByRole("button", { name: "Open left panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("region").should("not.exist");

      cy.findByRole("button", { name: "Open left panel" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");

      cy.realPress("Escape");
      cy.findByRole("region").should("not.exist");

      cy.findByRole("button", { name: "Open left panel" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region").should("have.attr", "role", "region");
    });

    it("Default story - WHEN opened and closed, THEN ARIA, class, and focus behavior are correct", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open right panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("button", { name: "Open right panel" }).click();
      cy.findByRole("button", { name: "Open right panel" }).should(
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
          cy.findByRole("button", { name: "Open right panel" }).should(
            "have.attr",
            "aria-controls",
            panelId,
          );
        });

      cy.findByRole("button", { name: "Close Section Title" }).should(
        "have.focus",
      );

      cy.realPress("Escape");
      cy.findByRole("region").should("not.exist");
      cy.focused().should("have.text", "Open right panel");

      cy.findByRole("button", { name: "Open right panel" }).click();
      cy.findByRole("button", { name: "Close Section Title" }).should(
        "have.focus",
      );

      cy.findByRole("button", { name: "Close Section Title" }).click();
      cy.findByRole("button", { name: "Open right panel" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("region").should("not.exist");
      cy.focused().should("have.text", "Open right panel");
    });

    it("ManualTrigger - WHEN used, THEN aria-expanded and aria-controls are managed correctly", () => {
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
    it("SHOULD manage open state and focus correctly", () => {
      const onOpenChange = cy.stub().as("onOpenChange");

      cy.mount(
        <SidePanelProvider onOpenChange={onOpenChange}>
          <SidePanelTrigger>
            <button>Open Panel</button>
          </SidePanelTrigger>
          <SidePanel>
            <SidePanelHeader>
              <SidePanelTitle>Test Panel</SidePanelTitle>
              <button>Close</button>
            </SidePanelHeader>
            <SidePanelContent>Content</SidePanelContent>
          </SidePanel>
        </SidePanelProvider>,
      );

      cy.findByRole("region").should("not.exist");
      cy.findByRole("button", { name: "Open Panel" }).click();

      cy.get("@onOpenChange").should("have.been.calledWith", true);

      cy.findByRole("region", { name: "Test Panel" }).should("be.visible");
      cy.findByRole("button", { name: "Close" }).should("have.focus");

      cy.realPress("Escape");

      cy.get("@onOpenChange").should("have.been.calledWith", false);
      cy.findByRole("region").should("not.exist");
    });

    it("SHOULD place panel content after the trigger in keyboard order while open", () => {
      cy.mount(<FocusOrderPanel />);

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Before trigger" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");

      cy.realPress("Enter");
      cy.findByRole("button", { name: "Close Focus Panel" }).should(
        "have.focus",
      );

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");
      cy.findByRole("region", { name: "Focus Panel" }).should("be.visible");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Close Focus Panel" }).should(
        "have.focus",
      );

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "After trigger" }).should("have.focus");
      cy.findByRole("region", { name: "Focus Panel" }).should("be.visible");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "After trigger" }).should("have.focus");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Close Focus Panel" }).should(
        "have.focus",
      );

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");
    });

    it("SHOULD preserve natural tab order when focus enters the panel from page content", () => {
      cy.mount(<NaturalTabOrderPanel />);

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Close Natural Order Panel" }).should(
        "have.focus",
      );

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "After trigger" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Later page action" }).should(
        "have.focus",
      );

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Close Natural Order Panel" }).should(
        "have.focus",
      );

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Later page action" }).should(
        "have.focus",
      );

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Close Natural Order Panel" }).should(
        "have.focus",
      );

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "After panel" }).should("have.focus");
    });
  });

  describe("WithTable", () => {
    it("WHEN different row Edit buttons are clicked sequentially, THEN details update and table remains visible after close", () => {
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
        cy.findByDisplayValue("alex.morgan@example.com").should("be.visible");
        cy.findByDisplayValue("+1 212 555 0101").should("be.visible");
      });

      cy.findByRole("button", {
        name: "Close Alex Morgan Employee Details",
      }).click();
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
        cy.findByDisplayValue("jordan.lee@example.com").should("be.visible");
      });
    });

    it("WHEN Edit buttons are activated and panel is closed in different ways, THEN focus moves into panel on open and returns to trigger on close", () => {
      cy.mount(<WithTable />);

      // First Edit click — focus moves into the panel
      cy.findByRole("button", {
        name: "Edit details for Alex Morgan",
      }).click();
      cy.findByRole("region", {
        name: "Alex Morgan Employee Details",
      }).should("be.visible");
      cy.findByRole("button", {
        name: "Close Alex Morgan Employee Details",
      }).should("have.focus");

      // Switch rows while panel is open — panel updates content
      cy.findByRole("button", {
        name: "Edit details for Taylor Reed",
      }).click();
      cy.findByRole("region", {
        name: "Taylor Reed Employee Details",
      }).should("be.visible");

      // Close via Escape — focus returns to the trigger
      cy.findByRole("button", {
        name: "Close Taylor Reed Employee Details",
      }).focus();
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
      cy.findByRole("button", {
        name: "Close Alex Morgan Employee Details",
      }).click();
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

  describe("Scrollable", () => {
    it("WHEN panel content scrollability differs, THEN body focusability attributes match configuration", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open right panel" }).click();

      cy.get(".saltSidePanelContent-body").should("be.visible");
      cy.get(".saltSidePanelContent-body").should("not.have.attr", "tabindex");
      cy.get(".saltSidePanelContent-body").should("not.have.attr", "role");

      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.get(".saltSidePanelContent-body")
        .should("be.visible")
        .and("have.attr", "tabindex", "0")
        .and("have.attr", "role", "region");
    });

    it("WHEN scrollable panel is opened and closed, THEN focus, visibility, and toggle behavior are correct", () => {
      cy.mount(<Scrollable />);

      cy.findByRole("button", { name: "Toggle right panel" }).click();

      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("region", { name: "Main content" }).should("be.visible");

      cy.findByRole("button", { name: "Close Section Title" }).should(
        "have.focus",
      );

      cy.findByRole("button", { name: "Close Section Title" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("not.exist");

      cy.findByRole("button", { name: "Toggle right panel" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
    });

    it("WHEN content changes make the panel body scrollable, THEN body focusability attributes update", () => {
      cy.mount(<DynamicScrollablePanel />);

      cy.get(".saltSidePanelContent-body").should("not.have.attr", "tabindex");

      cy.findByRole("button", { name: "Expand content" }).click();

      cy.get(".saltSidePanelContent-body")
        .should("have.attr", "tabindex", "0")
        .and("have.attr", "role", "region");
    });
  });

  describe("WithNav", () => {
    it("WHEN panel is opened and then closed, THEN nav remains visible throughout", () => {
      cy.mount(<WithNav />);

      cy.findByRole("button", { name: "Open side panel" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("be.visible");
      cy.findByRole("navigation").should("be.visible");

      cy.findByRole("button", { name: "Close Section Title" }).click();
      cy.findByRole("region", { name: "Section Title" }).should("not.exist");
      cy.findByRole("navigation").should("be.visible");
    });
  });
});
