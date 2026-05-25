import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuGroups,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
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
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <MegaMenuItem
                href="/see-all-solutions"
                onClick={(e) => e.preventDefault()}
              >
                See all solutions
              </MegaMenuItem>
            </ol>
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
                  render={<a href="/digital-banking" data-custom-link="" />}
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

    it("can navigate to orphaned items outside groups", () => {
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
      cy.get(".saltMegaMenuPanel a[data-mega-menu-item]").should(
        "have.length",
        1,
      );
    });
  });
});
