import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuGroups,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuRegion,
  MegaMenuSupportingActions,
  MegaMenuSupportingContent,
  MegaMenuTrigger,
} from "@salt-ds/lab";

const KeyboardMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem
                  href="/digital-banking"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuItem>
                <MegaMenuItem
                  href="/risk-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Risk Management
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem
                  href="/patient-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Patient Management
                </MegaMenuItem>
                <MegaMenuItem
                  href="/telemedicine"
                  onClick={(e) => e.preventDefault()}
                >
                  Telemedicine
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      </li>

      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Consulting</MegaMenuHeader>
                <MegaMenuItem
                  href="/strategy"
                  onClick={(e) => e.preventDefault()}
                >
                  Strategy
                </MegaMenuItem>
                <MegaMenuItem
                  href="/operations"
                  onClick={(e) => e.preventDefault()}
                >
                  Operations
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

const OrphanedItemMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem
                  href="/digital-banking"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuItem>
                <MegaMenuItem
                  href="/risk-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Risk Management
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
            <MegaMenuRegion>
              <MegaMenuItem
                href="/see-all-solutions"
                onClick={(e) => e.preventDefault()}
              >
                See all solutions
              </MegaMenuItem>
            </MegaMenuRegion>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Fixture with a non-focusable item (an `<a>` without `href` and no `render`).
// Verifies that `useMegaMenuKeyboard` skips it and that keyboard navigation
// continues to the next reachable item rather than stalling.
const MixedFocusabilityMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                {/* Intentionally no href and no render — should be skipped. */}
                <MegaMenuItem>Non Focusable</MegaMenuItem>
                <MegaMenuItem
                  href="/digital-banking"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Fixture exercising the `render` prop: a router-style component substituted
// for the default `<a>`. Using a plain `<a href>` here keeps the test free of
// router dependencies while still verifying that `render` replaces the host
// element rather than wrapping it (so we should see a single `<a>`, not nested
// links).
const RenderPropMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem
                  render={
                    <a href="/digital-banking" data-custom-link="">
                      Digital Banking
                    </a>
                  }
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Fixture exercising custom regions (`MegaMenuSupportingActions` /
// `MegaMenuSupportingContent`). Both render a non-focusable wrapper carrying
// `data-mega-menu-column`, so their interactive children should join the
// keyboard navigation sequence in layout order while the wrapper itself stays
// out of the tab order. The interactive children are deliberately different
// element types (an `<a href>` and a `<button>`) to prove both are picked up.
const CustomRegionMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem
                  href="/digital-banking"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuItem>
                <MegaMenuItem
                  href="/risk-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Risk Management
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
            <MegaMenuSupportingActions>
              <a href="/book-a-demo">Book a demo</a>
            </MegaMenuSupportingActions>
            <MegaMenuSupportingContent>
              <button type="button">View guidelines</button>
            </MegaMenuSupportingContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

const focusSolutionsTrigger = () => {
  cy.findByRole("button", { name: "Solutions" }).focus().should("be.focused");
};

const openSolutionsWithEnter = () => {
  focusSolutionsTrigger();
  cy.realPress("Enter");
  cy.get(".saltMegaMenuPanel").should("exist");
};

describe("Given a MegaMenu", () => {
  describe("when focus is on the trigger and menu is closed", () => {
    (["Enter", " ", "ArrowDown"] as const).forEach((key) => {
      it(`opens on ${key}`, () => {
        cy.mount(<KeyboardMegaMenu />);
        focusSolutionsTrigger();
        cy.realPress(key);
        cy.get(".saltMegaMenuPanel").should("exist");
      });
    });

    it("does not open on Tab", () => {
      cy.mount(<KeyboardMegaMenu />);
      focusSolutionsTrigger();
      cy.realPress("Tab");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("moves focus to next trigger on ArrowRight", () => {
      cy.mount(<KeyboardMegaMenu />);
      focusSolutionsTrigger();

      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("moves focus to previous trigger on ArrowLeft", () => {
      cy.mount(<KeyboardMegaMenu />);
      cy.findByRole("button", { name: "Services" })
        .focus()
        .should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });
  });

  describe("when menu is open", () => {
    it("moves focus to first item on Tab from trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("moves focus to first item on ArrowDown from trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("ArrowRight on an open trigger closes the panel and moves to the next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      // Focus stays on the trigger after opening with Enter.
      openSolutionsWithEnter();
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");

      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
      // The previously-open Solutions panel must collapse.
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("ArrowLeft on an open trigger closes the panel and moves to the previous trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("supports ArrowDown and ArrowUp between items and trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("supports ArrowDown and ArrowUp within and across groups", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // Within the first group
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Last item of first group -> first item of next group
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );

      // First item of second group -> last item of previous group
      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");
    });

    it("supports ArrowRight and ArrowLeft across groups", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowRight");
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );

      cy.realPress("ArrowLeft");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("ArrowUp on the first item returns focus to the trigger and keeps the menu open", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowLeft on the first item returns focus to the trigger and keeps the menu open", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowRight from the last column has no effect when there is no next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      // Open the last menu (Services), which has no trigger after it.
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      cy.realPress("Tab"); // Strategy
      cy.realPress("Tab"); // Operations
      cy.findByRole("link", { name: "Operations" }).should("be.focused");

      cy.realPress("ArrowRight");
      // Nothing happens: focus stays put and the panel remains open.
      cy.findByRole("link", { name: "Operations" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowRight from last column closes menu and moves to next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management
      cy.realPress("Tab"); // Telemedicine
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");

      cy.realPress("ArrowRight");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("has no effect on ArrowDown from last item in last column", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management
      cy.realPress("Tab"); // Telemedicine
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");

      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("supports Tab and Shift+Tab inside menu", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("returns focus to trigger on Shift+Tab from first item and Tab re-enters first item", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("closes on Escape", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("activates item on Enter and closes menu", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("activates item on Space and closes menu", () => {
      // Native anchors activate on Enter but not Space — MegaMenuItem adds
      // Space handling for parity, so this exercises that custom branch.
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Space");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("tabs from the last item to the next trigger and closes the panel", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management
      cy.realPress("Tab"); // Telemedicine
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("closes on Escape when focus is still on the trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      focusSolutionsTrigger();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // Focus has not yet moved into the panel — Escape should still dismiss it.
      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("supports Home to jump to first item in column", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress("Home");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("supports End to jump to last item in column", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("End");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");
    });

    it("returns focus to trigger on Escape", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("can navigate to items in a side region outside groups", () => {
      cy.mount(<OrphanedItemMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // See all solutions
      cy.findByRole("link", { name: "See all solutions" }).should("be.focused");
    });

    it("skips non-focusable items and focuses the next reachable item", () => {
      cy.mount(<MixedFocusabilityMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // ArrowDown from the trigger should land on the first focusable item,
      // skipping the non-focusable "Non Focusable" entry.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("treats `render` prop element as the focusable target", () => {
      cy.mount(<RenderPropMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" })
        .should("be.focused")
        .and("have.attr", "data-custom-link");
    });

    it("renders no duplicate <a> when using `render` (render replaces, not wraps)", () => {
      cy.mount(<RenderPropMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).click();
      // Exactly one anchor for the item — verifies `renderProps` substitutes
      // the host element instead of wrapping it (no link-in-a-link).
      cy.get(".saltMegaMenuPanel a.saltMegaMenuItem").should("have.length", 1);
    });
  });

  describe("when the menu has custom regions", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("includes interactive elements from custom regions in the Tab sequence, in layout order", () => {
      cy.mount(<CustomRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Continues into the supporting actions region (an `<a>`)...
      cy.realPress("Tab");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      // ...then the supporting content region (a `<button>`).
      cy.realPress("Tab");
      cy.findByRole("button", { name: "View guidelines" }).should("be.focused");
    });

    it("does not put the custom region wrapper itself in the tab order", () => {
      cy.mount(<CustomRegionMegaMenu />);
      openSolutions();

      // The wrappers must not be focusable (no tabindex).
      cy.get(".saltMegaMenuSupportingActions").should(
        "not.have.attr",
        "tabindex",
      );
      cy.get(".saltMegaMenuSupportingContent").should(
        "not.have.attr",
        "tabindex",
      );

      // Tabbing from the last group item lands directly on the interactive
      // child, never on the wrapper element.
      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Book a demo (inside supporting actions)
      cy.focused()
        .should("have.attr", "href", "/book-a-demo")
        .and("not.have.class", "saltMegaMenuSupportingActions");
    });

    it("tabs out of the menu and closes it after the last custom-region element", () => {
      cy.mount(<CustomRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Book a demo
      cy.realPress("Tab"); // View guidelines
      cy.findByRole("button", { name: "View guidelines" }).should("be.focused");

      cy.realPress("Tab");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      // Focus must move to the next real focusable element after the menu —
      // not be lost to a hidden focus-guard span (and thus to <body>).
      cy.findByRole("button", { name: "After Nav" }).should("be.focused");
    });

    it("walks Shift+Tab backwards through custom-region elements without losing focus", () => {
      cy.mount(<CustomRegionMegaMenu />);
      openSolutions();

      // Forward to the last custom-region element.
      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Book a demo (supporting actions)
      cy.realPress("Tab"); // View guidelines (supporting content)
      cy.findByRole("button", { name: "View guidelines" }).should("be.focused");

      // Reverse must mirror the forward order exactly, never dropping focus.
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // From the first item, Shift+Tab returns to the trigger (menu stays open).
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("moves into and across custom-region columns with ArrowRight", () => {
      cy.mount(<CustomRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // Group column -> supporting actions column.
      cy.realPress("ArrowRight");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      // Supporting actions column -> supporting content column.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "View guidelines" }).should("be.focused");

      // Last column, no next trigger -> no-op, focus stays put.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "View guidelines" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });
  });
});
