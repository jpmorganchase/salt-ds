import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBand,
  MegaMenuGroup,
  MegaMenuGroups,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuRegion,
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

// Groups followed by a trailing `MegaMenuRegion`. Source order places the
// region to the right of the groups; its interactive children become a
// navigable column carrying `data-mega-menu-column`.
const SideRegionMegaMenu = () => (
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
            <MegaMenuRegion>
              <a href="/see-all">See all solutions</a>
              <button type="button">Contact sales</button>
            </MegaMenuRegion>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

// A leading `MegaMenuRegion` placed before groups renders to the left, so it
// becomes the first navigable column.
const LeadingRegionMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuRegion>
              <a href="/featured">Featured</a>
            </MegaMenuRegion>
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
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Groups followed by a full-width `MegaMenuBand`. Source order after groups
// renders the band on the bottom; it carries `data-mega-menu-band` and its
// children move horizontally.
const BottomBandMegaMenu = () => (
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
            <MegaMenuBand>
              <a href="/book-a-demo">Book a demo</a>
              <button type="button">Support center</button>
            </MegaMenuBand>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A full-width `MegaMenuBand` placed before groups renders on top.
const TopBandMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuBand>
              <a href="/whats-new">What's new</a>
              <button type="button">Announcements</button>
            </MegaMenuBand>
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
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A `MegaMenuRegion` containing a self-consuming control (a text input). The
// engine must not hijack arrow keys while focus is inside it.
const RoleAwareMegaMenu = () => (
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
              </MegaMenuGroup>
            </MegaMenuGroups>
            <MegaMenuRegion>
              <input aria-label="Search" defaultValue="hello" />
            </MegaMenuRegion>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Fixture with a non-focusable item (an `<a>` without `href` and no `render`).
// Verifies the engine skips it and navigation continues to the next reachable
// item rather than stalling.
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
// for the default `<a>`. Using a plain `<a href>` keeps the test free of router
// dependencies while still verifying that `render` replaces the host element
// rather than wrapping it (so a single `<a>`, not nested links).
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

    it("keeps ArrowUp/ArrowDown within a column", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // Within the first column.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Last item of the column with no band below — ArrowDown is a no-op and
      // does NOT cross into the next column.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");
    });

    it("crosses columns with ArrowRight and ArrowLeft", () => {
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

    it("ArrowLeft on the first column returns focus to the trigger and keeps the menu open", () => {
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
      cy.findByRole("link", { name: "Strategy" }).should("be.focused");

      cy.realPress("ArrowRight");
      // Nothing happens: focus stays put and the panel remains open.
      cy.findByRole("link", { name: "Strategy" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowRight from last column closes menu and moves to next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowRight"); // Patient Management (second column)
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );

      cy.realPress("ArrowRight");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("has no effect on ArrowDown from last item in last column", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowRight"); // Patient Management
      cy.realPress("ArrowDown"); // Telemedicine (last item, last column)
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

  describe("when the menu has a side region", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("includes the region's interactive elements in the Tab sequence, in layout order", () => {
      cy.mount(<SideRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Continues into the trailing region (a link, then a button).
      cy.realPress("Tab");
      cy.findByRole("link", { name: "See all solutions" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("button", { name: "Contact sales" }).should("be.focused");
    });

    it("does not put the region wrapper itself in the tab order", () => {
      cy.mount(<SideRegionMegaMenu />);
      openSolutions();

      cy.get(".saltMegaMenuRegion").should("not.have.attr", "tabindex");
    });

    it("crosses into the region column with ArrowRight and within it with ArrowDown", () => {
      cy.mount(<SideRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // Group column -> region column (first item).
      cy.realPress("ArrowRight");
      cy.findByRole("link", { name: "See all solutions" }).should("be.focused");

      // Within the region column.
      cy.realPress("ArrowDown");
      cy.findByRole("button", { name: "Contact sales" }).should("be.focused");

      // Last column, no next trigger -> no-op.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Contact sales" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("tabs out of the menu and closes it after the last region element", () => {
      cy.mount(<SideRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // See all solutions
      cy.realPress("Tab"); // Contact sales
      cy.findByRole("button", { name: "Contact sales" }).should("be.focused");

      cy.realPress("Tab");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      // Focus must move to the next real focusable after the menu — not be lost
      // to a hidden focus-guard span (and thus to <body>).
      cy.findByRole("button", { name: "After Nav" }).should("be.focused");
    });

    it("walks Shift+Tab backwards through region elements without losing focus", () => {
      cy.mount(<SideRegionMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // See all solutions
      cy.realPress("Tab"); // Contact sales
      cy.findByRole("button", { name: "Contact sales" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "See all solutions" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // From the first item, Shift+Tab returns to the trigger (menu stays open).
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("treats a leading region as the first column and returns to the trigger on ArrowLeft", () => {
      cy.mount(<LeadingRegionMegaMenu />);
      openSolutions();

      // Tab lands on the leading region first (it is the leftmost column).
      cy.realPress("Tab");
      cy.findByRole("link", { name: "Featured" }).should("be.focused");

      // ArrowRight crosses into the group column.
      cy.realPress("ArrowRight");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // ArrowLeft returns to the leading region column.
      cy.realPress("ArrowLeft");
      cy.findByRole("link", { name: "Featured" }).should("be.focused");

      // ArrowLeft on the first column returns to the trigger (menu stays open).
      cy.realPress("ArrowLeft");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });
  });

  describe("when the menu has a band", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("crosses from the column grid into a bottom band on ArrowDown and moves within it", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management (last item in column)
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // ArrowDown on the last column item crosses into the bottom band.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      // Within the band, Left/Right move horizontally.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");
    });

    it("crosses from a bottom band back into the column grid on ArrowUp", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.realPress("ArrowDown"); // Book a demo (band)
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("crosses from the column grid into a top band on ArrowUp and back down again", () => {
      cy.mount(<TopBandMegaMenu />);
      openSolutions();

      // Tab lands on the band first (it is the topmost element).
      cy.realPress("Tab");
      cy.findByRole("link", { name: "What's new" }).should("be.focused");

      // ArrowDown from the top band drops into the column grid.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // ArrowUp on the first column item crosses back up into the top band.
      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "What's new" }).should("be.focused");

      // ArrowUp on the top band returns to the trigger (menu stays open).
      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });
  });

  describe("when focus is inside a self-consuming control", () => {
    it("does not hijack arrow keys from an input inside a region", () => {
      cy.mount(<RoleAwareMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // Place the caret at the end of the input's value.
      cy.findByRole("textbox", { name: "Search" }).then(($input) => {
        const input = $input[0] as HTMLInputElement;
        input.focus();
        input.setSelectionRange(
          input.value.length,
          input.value.length,
        );
      });
      cy.findByRole("textbox", { name: "Search" }).should("be.focused");

      // ArrowLeft must reach the input (moving the caret), not be intercepted by
      // the navigation engine.
      cy.realPress("ArrowLeft");
      cy.findByRole("textbox", { name: "Search" })
        .should("be.focused")
        .then(($input) => {
          const input = $input[0] as HTMLInputElement;
          expect(input.selectionStart).to.be.lessThan(input.value.length);
        });
    });
  });
});
