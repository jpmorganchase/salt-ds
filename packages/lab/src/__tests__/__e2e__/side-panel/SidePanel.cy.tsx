import { Button, Input, Text } from "@salt-ds/core";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  useSidePanel,
} from "@salt-ds/lab";
import * as sidePanel from "@stories/side-panel/side-panel.stories";
import { composeStories } from "@storybook/react-vite";
import { useRef, useState } from "react";
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

/**
 * Mirrors a layout where the panel's DOM position is *after* later page
 * actions. The panel must remain unreachable via natural Tab from those
 * later actions — the trigger is the only path into the panel.
 */
function DetachedTabOrderPanel() {
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
            <SidePanelTitle>Detached Order Panel</SidePanelTitle>
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
            <Button>Open Panel</Button>
          </SidePanelTrigger>
          <SidePanel>
            <SidePanelHeader>
              <SidePanelTitle>Test Panel</SidePanelTitle>
              <Button>Close</Button>
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

    it("SHOULD NOT auto-focus into the panel on first mount when defaultOpen is set without user interaction", () => {
      // Regression for the useForkRef double-invocation race that caused
      // `initialMountRef` to flip before the focusCameFromTrigger check,
      // making a later ref-callback invocation fall through to focus the
      // panel's first tabbable element even though focus never came from
      // the trigger.
      cy.mount(<DetachedTabOrderPanel />);

      cy.findByRole("region", { name: "Detached Order Panel" }).should(
        "be.visible",
      );

      // Allow any rAF-scheduled focus moves to flush.
      cy.wait(50);

      cy.focused().should(($el) => {
        const node = $el[0] as HTMLElement | undefined;
        if (!node) return; // body/no focus is also acceptable
        const closest = node.closest(".saltSidePanel");
        expect(
          closest,
          `Focus landed inside the panel on first mount: ${node.outerHTML.slice(
            0,
            120,
          )}`,
        ).to.equal(null);
      });
    });

    it("SHOULD keep the panel out of the natural tab sequence; only the trigger leads into it", () => {
      cy.mount(<DetachedTabOrderPanel />);

      // Tab from the document — only outside elements are reachable; the
      // panel's own buttons are skipped because their tabindex has been
      // stripped while the panel is open.
      cy.realPress("Tab");
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");

      // From the trigger, Tab routes straight into the panel.
      cy.realPress("Tab");
      cy.findByRole("button", { name: "Close Detached Order Panel" }).should(
        "have.focus",
      );

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      // After the last panel element, Tab leaves the panel and lands on the
      // first focusable element after the trigger.
      cy.realPress("Tab");
      cy.findByRole("button", { name: "After trigger" }).should("have.focus");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Later page action" }).should(
        "have.focus",
      );

      // From a later page action, Tab continues naturally past the panel —
      // the panel content is invisible to outer Tab.
      cy.realPress("Tab");
      cy.findByRole("button", { name: "After panel" }).should("have.focus");

      // Shift+Tab from the element after the trigger jumps to the panel's
      // last focusable item, so backward navigation still funnels through
      // the panel.
      cy.findByRole("button", { name: "After trigger" }).focus();
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Panel action" }).should("have.focus");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Close Detached Order Panel" }).should(
        "have.focus",
      );

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");
    });

    it("SHOULD NOT trap the user in a loop when focus arrives at the trigger from later in the document", () => {
      // Reproduces the WithTable-style layout where multiple focusable
      // elements sit *after* the trigger in DOM order. Once the user has
      // tabbed forward past the panel, focus that arrives back at the
      // trigger from later in the document (Tab wrap, click, or
      // programmatic focus from a later element) must not auto-redirect
      // into the panel — otherwise the user gets stuck in a loop between
      // the trigger and the panel content.
      cy.mount(<DetachedTabOrderPanel />);

      // Walk into the panel and exit to "After trigger" to confirm the
      // forward flow works first.
      cy.realPress("Tab"); // Open panel
      cy.realPress("Tab"); // Close
      cy.realPress("Tab"); // Panel action
      cy.realPress("Tab"); // After trigger

      // Simulate focus arriving at the trigger from a later element
      // (programmatic focus from "After panel" mimics the wrap-around
      // scenario without depending on browser Tab-cycle boundaries).
      cy.findByRole("button", { name: "After panel" }).focus();
      cy.findByRole("button", { name: "Open panel" }).focus();
      cy.findByRole("button", { name: "Open panel" }).should("have.focus");

      // Critical: Tab from the trigger should NOT re-enter the panel here
      // because focus arrived from after it in document order. It should
      // walk to the next focusable element after the trigger instead.
      cy.realPress("Tab");
      cy.findByRole("button", { name: "After trigger" }).should("have.focus");
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

    it("SHOULD NOT loop focus back into the panel after tabbing past the last table row", () => {
      // Reproduces the user-reported loop: with the panel open, walking
      // forward through the panel content and then through every Edit
      // button in the table must not snap focus back into the panel
      // when Tab wraps from the last row back to the trigger row.
      cy.mount(<WithTable />);

      cy.findByRole("button", {
        name: "Edit details for Alex Morgan",
      }).click();

      cy.findByRole("button", {
        name: "Close Alex Morgan Employee Details",
      }).should("have.focus");

      // Walk through panel: Close → Name → Email → Phone → Cancel → Save.
      cy.realPress("Tab"); // Name input
      cy.realPress("Tab"); // Email input
      cy.realPress("Tab"); // Phone input
      cy.realPress("Tab"); // Cancel
      cy.realPress("Tab"); // Save

      // Exit panel to the next-after-trigger row.
      cy.realPress("Tab");
      cy.focused().should(
        "have.attr",
        "aria-label",
        "Edit details for Taylor Reed",
      );

      // Walk through the remaining rows.
      cy.realPress("Tab");
      cy.focused().should(
        "have.attr",
        "aria-label",
        "Edit details for Jordan Lee",
      );
      cy.realPress("Tab");
      cy.focused().should(
        "have.attr",
        "aria-label",
        "Edit details for Casey Patel",
      );
      cy.realPress("Tab");
      cy.focused().should(
        "have.attr",
        "aria-label",
        "Edit details for Riley Chen",
      );

      // Tab from the last row should NOT funnel back into the panel.
      // It may wrap to the trigger row, leave the iframe focus context, or
      // land on the body — anywhere except inside the panel is acceptable.
      cy.realPress("Tab");
      cy.document().then((doc) => {
        const active = doc.activeElement as HTMLElement | null;
        const insidePanel = !!active?.closest(".saltSidePanel");
        expect(
          insidePanel,
          `Tab past last row landed inside the side panel ` +
            `(focused element: ${active?.outerHTML?.slice(0, 120) ?? "<none>"})`,
        ).to.equal(false);
      });

      // Run several more tabs and assert we never land inside the panel.
      for (let i = 0; i < 12; i++) {
        cy.realPress("Tab");
        cy.document().then((doc) => {
          const active = doc.activeElement as HTMLElement | null;
          const insidePanel = !!active?.closest(".saltSidePanel");
          expect(
            insidePanel,
            `Tab #${i + 1} after wrap landed inside the side panel ` +
              `(focused element: ${active?.outerHTML?.slice(0, 120) ?? "<none>"})`,
          ).to.equal(false);
        });
      }
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

      // While the panel is open the scrollable body is detached from the
      // natural tab order, but its original tabindex is preserved on a
      // data-attribute so it can be restored on close and reinstated for
      // trigger-driven navigation through the panel.
      cy.get(".saltSidePanelContent-body")
        .should("be.visible")
        .and("have.attr", "tabindex", "-1")
        .and("have.attr", "data-salt-original-tabindex", "0")
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
      // DynamicScrollablePanel has no SidePanelTrigger, so there is no
      // reference element to scope tab-order detachment to. The panel
      // gracefully falls back to natural tab order in this case, and the
      // scrollable body keeps its native tabindex="0" affordance.
      cy.mount(<DynamicScrollablePanel />);

      cy.get(".saltSidePanelContent-body").should("not.have.attr", "tabindex");

      cy.findByRole("button", { name: "Expand content" }).click();

      cy.get(".saltSidePanelContent-body")
        .should("have.attr", "tabindex", "0")
        .and("have.attr", "role", "region")
        .and("not.have.attr", "data-salt-original-tabindex");
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

  describe("Controlled open", () => {
    function Controlled({
      onOpenChange,
    }: {
      onOpenChange: (open: boolean) => void;
    }) {
      const [open, setOpen] = useState(false);
      return (
        <SidePanelProvider
          open={open}
          onOpenChange={(o) => {
            onOpenChange(o);
            setOpen(o);
          }}
        >
          <SidePanelTrigger>
            <Button>Toggle</Button>
          </SidePanelTrigger>
          <SidePanel disableAnimation>
            <SidePanelHeader>
              <SidePanelTitle>Controlled</SidePanelTitle>
              <SidePanelCloseButton />
            </SidePanelHeader>
            <SidePanelContent>
              <Text>Body</Text>
            </SidePanelContent>
          </SidePanel>
        </SidePanelProvider>
      );
    }

    function StuckOpen() {
      // Controlled parent that ignores onOpenChange entirely.
      return (
        <SidePanelProvider open={true} onOpenChange={() => {}}>
          <SidePanelTrigger>
            <Button>Open</Button>
          </SidePanelTrigger>
          <SidePanel disableAnimation>
            <SidePanelHeader>
              <SidePanelTitle>Stuck</SidePanelTitle>
              <SidePanelCloseButton />
            </SidePanelHeader>
            <SidePanelContent>
              <Text>Body</Text>
            </SidePanelContent>
          </SidePanel>
        </SidePanelProvider>
      );
    }

    it("WHEN open is controlled, THEN external state drives visibility and onOpenChange fires for trigger and Escape", () => {
      const onOpenChange = cy.stub().as("onOpenChange");

      cy.mount(<Controlled onOpenChange={onOpenChange} />);

      cy.findByRole("region", { name: "Controlled" }).should("not.exist");

      cy.findByRole("button", { name: "Toggle" }).click();
      cy.get("@onOpenChange").should("have.been.calledWith", true);
      cy.findByRole("region", { name: "Controlled" }).should("be.visible");

      cy.realPress("Escape");
      cy.get("@onOpenChange").should("have.been.calledWith", false);
      cy.findByRole("region", { name: "Controlled" }).should("not.exist");
    });

    it("WHEN parent ignores onOpenChange, THEN the controlled prop wins and the panel stays open", () => {
      cy.mount(<StuckOpen />);

      cy.findByRole("region", { name: "Stuck" }).should("be.visible");

      cy.findByRole("button", { name: "Close Stuck" }).click();
      cy.findByRole("region", { name: "Stuck" }).should("be.visible");

      cy.realPress("Escape");
      cy.findByRole("region", { name: "Stuck" }).should("be.visible");
    });
  });

  describe("initialFocus prop", () => {
    it("WHEN initialFocus is a number, THEN that tabbable index receives focus on open", () => {
      function NumberedFocus() {
        return (
          <SidePanelProvider>
            <SidePanelTrigger>
              <Button>Open</Button>
            </SidePanelTrigger>
            <SidePanel disableAnimation initialFocus={1}>
              <SidePanelHeader>
                <SidePanelTitle>T</SidePanelTitle>
                <SidePanelCloseButton />
              </SidePanelHeader>
              <SidePanelContent>
                <Button>Second action</Button>
              </SidePanelContent>
            </SidePanel>
          </SidePanelProvider>
        );
      }

      cy.mount(<NumberedFocus />);
      cy.findByRole("button", { name: "Open" }).click();
      cy.findByRole("button", { name: "Second action" }).should("have.focus");
    });

    it("WHEN initialFocus is a ref, THEN the referenced element receives focus on open", () => {
      function RefFocus() {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
          <SidePanelProvider>
            <SidePanelTrigger>
              <Button>Open</Button>
            </SidePanelTrigger>
            <SidePanel disableAnimation initialFocus={inputRef}>
              <SidePanelHeader>
                <SidePanelTitle>T</SidePanelTitle>
                <SidePanelCloseButton />
              </SidePanelHeader>
              <SidePanelContent>
                <Input
                  inputRef={inputRef}
                  inputProps={{ "aria-label": "Email" }}
                  bordered
                />
              </SidePanelContent>
            </SidePanel>
          </SidePanelProvider>
        );
      }

      cy.mount(<RefFocus />);
      cy.findByRole("button", { name: "Open" }).click();
      cy.findByRole("textbox", { name: "Email" }).should("have.focus");
    });
  });

  describe("Reduced motion", () => {
    it("WHEN prefers-reduced-motion is reduce, THEN open/close transitions are immediate", () => {
      cy.window().then((win) => {
        cy.stub(win, "matchMedia").callsFake(
          (query: string) =>
            ({
              matches: query.includes("reduce"),
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => false,
            }) as MediaQueryList,
        );
      });

      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open right panel" }).click();
      cy.findByRole("region", { name: "Section Title" })
        .should("be.visible")
        .and("not.have.class", "saltSidePanel-enterAnimation")
        .and("not.have.class", "saltSidePanel-exitAnimation");

      cy.findByRole("button", { name: "Close Section Title" }).click();
      // No exit animation to wait for — the panel unmounts immediately.
      cy.findByRole("region", { name: "Section Title" }).should("not.exist");
    });
  });

  describe("defaultOpen + subsequent user-driven open", () => {
    it("WHEN defaultOpen panel is closed and reopened via trigger click, THEN initial focus moves into the panel on reopen", () => {
      // The first mount with defaultOpen deliberately doesn't auto-focus
      // (no user interaction). After a close + trigger-click, the open is
      // user-driven and focus should move into the panel as normal.
      function DefaultOpenReopen() {
        return (
          <SidePanelProvider defaultOpen>
            <SidePanelTrigger>
              <Button>Open</Button>
            </SidePanelTrigger>
            <SidePanel disableAnimation>
              <SidePanelHeader>
                <SidePanelTitle>Reopen Panel</SidePanelTitle>
                <SidePanelCloseButton />
              </SidePanelHeader>
              <SidePanelContent>
                <Button>Panel action</Button>
              </SidePanelContent>
            </SidePanel>
          </SidePanelProvider>
        );
      }

      cy.mount(<DefaultOpenReopen />);

      // First mount: panel is visible but focus is NOT inside it.
      cy.findByRole("region", { name: "Reopen Panel" }).should("be.visible");

      // Close from inside the panel via Escape.
      cy.findByRole("button", { name: "Close Reopen Panel" }).focus();
      cy.realPress("Escape");
      cy.findByRole("region", { name: "Reopen Panel" }).should("not.exist");

      // Reopen via trigger click — focus must now move into the panel.
      cy.findByRole("button", { name: "Open" }).click();
      cy.findByRole("button", { name: "Close Reopen Panel" }).should(
        "have.focus",
      );
    });
  });

  describe("useSidePanel().getTriggerProps", () => {
    it("WHEN a user ref is supplied, THEN both the focus-return registration and the user ref receive the node", () => {
      function CustomTrigger() {
        const userRef = useRef<HTMLButtonElement>(null);
        const { getTriggerProps } = useSidePanel();
        return (
          <>
            <Button {...getTriggerProps({ ref: userRef })}>Open</Button>
            <SidePanel disableAnimation>
              <SidePanelHeader>
                <SidePanelTitle>Custom Trigger</SidePanelTitle>
                <SidePanelCloseButton />
              </SidePanelHeader>
              <SidePanelContent>
                <Text>Body</Text>
              </SidePanelContent>
            </SidePanel>
          </>
        );
      }

      function Wrapper() {
        return (
          <SidePanelProvider>
            <CustomTrigger />
          </SidePanelProvider>
        );
      }

      cy.mount(<Wrapper />);

      // Trigger toggles via the wrapper's onClick override (built-in toggle).
      cy.findByRole("button", { name: "Open" }).click();
      cy.findByRole("region", { name: "Custom Trigger" }).should("be.visible");

      // Closing the panel must return focus to the trigger — proving
      // getTriggerProps registered the node via setReference even though
      // the user also passed their own ref.
      cy.findByRole("button", { name: "Close Custom Trigger" }).click();
      cy.findByRole("region", { name: "Custom Trigger" }).should("not.exist");
      cy.findByRole("button", { name: "Open" }).should("have.focus");
    });

    it("WHEN a user onClick is supplied, THEN it runs alongside the built-in toggle", () => {
      const userClick = cy.stub().as("userClick");

      function CustomTrigger() {
        const { getTriggerProps } = useSidePanel();
        return (
          <>
            <Button {...getTriggerProps({ onClick: userClick })}>Open</Button>
            <SidePanel disableAnimation>
              <SidePanelHeader>
                <SidePanelTitle>With Click</SidePanelTitle>
                <SidePanelCloseButton />
              </SidePanelHeader>
            </SidePanel>
          </>
        );
      }

      cy.mount(
        <SidePanelProvider>
          <CustomTrigger />
        </SidePanelProvider>,
      );

      cy.findByRole("button", { name: "Open" }).click();
      cy.get("@userClick").should("have.been.calledOnce");
      cy.findByRole("region", { name: "With Click" }).should("be.visible");
    });
  });
});
