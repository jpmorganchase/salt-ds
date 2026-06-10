import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuItem,
  MegaMenuItemList,
  MegaMenuPanel,
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      </li>

      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

// `MegaMenuBody` followed by a trailing `MegaMenuSupportingContent`. Source order places
// the content region to the right of the body; its interactive children become a
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
            <MegaMenuSupportingContent>
              <a href="/see-all">See all solutions</a>
              <button type="button">Contact sales</button>
            </MegaMenuSupportingContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

// A leading `MegaMenuSupportingContent` placed before `MegaMenuBody` renders to the left,
// so it becomes the first navigable column.
const LeadingRegionMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuSupportingContent>
              <a href="/featured">Featured</a>
            </MegaMenuSupportingContent>
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Groups followed by a full-width `MegaMenuSupportingActions`, both inside `MegaMenuBody`.
// The action bar is always the bottom of the center area; it carries
// `data-mega-menu-supporting-actions` and its children move horizontally.
const BottomBandMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuSupportingActions>
                <a href="/book-a-demo">Book a demo</a>
                <button type="button">Support center</button>
              </MegaMenuSupportingActions>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Like `BottomBandMegaMenu` but with a following trigger, so the action bar's last
// action can exit to the next trigger on ArrowRight/ArrowDown.
const BottomBandWithNextMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem
                      href="/digital-banking"
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuSupportingActions>
                <a href="/book-a-demo">Book a demo</a>
                <button type="button">Support center</button>
              </MegaMenuSupportingActions>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Services menu">
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem
                      href="/strategy"
                      onClick={(e) => e.preventDefault()}
                    >
                      Strategy
                    </MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A `MegaMenuSupportingContent` containing a self-consuming control (a text input). The
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem
                      href="/digital-banking"
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
            <MegaMenuSupportingContent>
              <input aria-label="Search" defaultValue="hello" />
            </MegaMenuSupportingContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A region (input + following link) used to verify Tab/Shift+Tab still traverse
// across a self-consuming control — only arrows/Home/End are yielded to it.
const RoleAwareTabMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem
                      href="/digital-banking"
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
            <MegaMenuSupportingContent>
              <input aria-label="Search" defaultValue="hello" />
              <a href="/go">Go</a>
            </MegaMenuSupportingContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Static-only content (no interactive descendants). The region and action bar must
// contribute no navigable cells and stay out of tab + arrow navigation.
const StaticContentMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuSupportingActions>
                <span>Footer note, nothing focusable.</span>
              </MegaMenuSupportingActions>
            </MegaMenuBody>
            <MegaMenuSupportingContent>
              <p>Static promotional text with no links.</p>
            </MegaMenuSupportingContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

// Fixture with a non-focusable item (an `<a>` without `href` and no `render`).
// Verifies the engine skips it and navigation continues to the next reachable
// item rather than stalling.
const ActionItemMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    {/* No href and no render — renders as a focusable button. */}
                    <MegaMenuItem onClick={(e) => e.preventDefault()}>
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      href="/digital-banking"
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuItemList>
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
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
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

    it("Shift+Tab on an open trigger closes the panel and moves to the previous trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("re-enters items on ArrowDown after ArrowUp returns to trigger (opened via ArrowDown)", () => {
      cy.mount(<KeyboardMegaMenu />);
      focusSolutionsTrigger();

      // Open with ArrowDown — focuses the first item.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // ArrowUp returns to the trigger, menu stays open.
      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");

      // ArrowDown again should re-enter the first item, NOT hang on the panel.
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

    it("moves to the next column on ArrowDown from the last item of a non-last column", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // Within the first column.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Last item of a non-last column: ArrowDown continues at the top of the
      // next column.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );
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

    it("ArrowDown from the bottom of the last column is a no-op when there is no next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      // Open the last menu (Services), which has no trigger after it.
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      cy.realPress("Tab"); // Strategy
      cy.realPress("ArrowDown"); // Operations (bottom of the only/last column)
      cy.findByRole("link", { name: "Operations" }).should("be.focused");

      // No next trigger: Down has nowhere to go, so it is a no-op.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Operations" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowRight from the bottom of the last column returns to the current trigger when there is no next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      // Open the last menu (Services), which has no trigger after it.
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      cy.realPress("Tab"); // Strategy
      cy.realPress("ArrowDown"); // Operations (bottom of the only/last column)
      cy.findByRole("link", { name: "Operations" }).should("be.focused");

      cy.realPress("ArrowRight");
      // No next trigger: Right wraps to the current trigger, panel stays open.
      cy.findByRole("button", { name: "Services" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowRight from a non-bottom item of the last column returns to the current trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowRight"); // Patient Management (top of last column)
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );

      // Right in the last column wraps to the current trigger (menu stays open),
      // except on the last item where it exits to the next trigger.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowRight from the bottom of the last column closes menu and moves to next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowRight"); // Patient Management (top of last column)
      cy.realPress("ArrowDown"); // Telemedicine (bottom of last column)
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");

      cy.realPress("ArrowRight");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("ArrowDown from the bottom of the last column closes menu and moves to next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowRight"); // Patient Management
      cy.realPress("ArrowDown"); // Telemedicine (bottom item, last column)
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");

      cy.realPress("ArrowDown");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
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

    it("does not activate an item on Space (links activate on Enter only)", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // A link activates on Enter, not Space, so the menu stays open and focus
      // is unchanged.
      cy.realPress("Space");
      cy.get(".saltMegaMenuPanel").should("exist");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
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

    it("renders an action item (no href/render) as a focusable button", () => {
      cy.mount(<ActionItemMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // ArrowDown lands on the action item, rendered as a focusable button.
      cy.realPress("ArrowDown");
      cy.findByRole("button", { name: "Telemedicine" }).should("be.focused");

      // ...and continues to the link beneath it.
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

      cy.get(".saltMegaMenuSupportingContent").should(
        "not.have.attr",
        "tabindex",
      );
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

      // Last item of the last column, no next trigger -> wrap to the current trigger.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
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

  describe("when the menu has an action bar", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("crosses from the column grid into a bottom action bar on ArrowDown and moves within it", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management (last item in column)
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // ArrowDown on the last column item crosses into the bottom action bar.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      // Within the action bar, Left/Right move horizontally.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");
    });

    it("crosses from a bottom action bar back into the column grid on ArrowUp", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.realPress("ArrowDown"); // Book a demo (action bar)
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");

      // ArrowUp reverses entry into the band: it returns to the last column's
      // last item (where ArrowDown dropped in from).
      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");
    });

    it("has no effect on ArrowDown from the last action when there is no next trigger", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.realPress("ArrowDown"); // Book a demo (action bar)
      cy.realPress("ArrowRight"); // Support center (last action bar item)
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      // No next trigger: Down has nowhere to go, so it is a no-op.
      cy.realPress("ArrowDown");
      cy.findByRole("button", { name: "Support center" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("returns to the current trigger on ArrowRight from the last action when there is no next trigger", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.realPress("ArrowDown"); // Book a demo (action bar)
      cy.realPress("ArrowRight"); // Support center (last action bar item)
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      // No next trigger: Right wraps to the current trigger, panel stays open.
      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("exits to the next trigger on ArrowRight from the last action", () => {
      cy.mount(<BottomBandWithNextMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Book a demo (action bar)
      cy.realPress("ArrowRight"); // Support center (last action bar item)
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      cy.realPress("ArrowRight");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("exits to the next trigger on ArrowDown from the last action", () => {
      cy.mount(<BottomBandWithNextMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Book a demo (action bar)
      cy.realPress("ArrowRight"); // Support center (last action bar item)
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      cy.realPress("ArrowDown");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("supports Home and End within an action bar", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.realPress("ArrowDown"); // Book a demo (action bar)

      cy.realPress("End");
      cy.findByRole("button", { name: "Support center" }).should("be.focused");

      cy.realPress("Home");
      cy.findByRole("link", { name: "Book a demo" }).should("be.focused");
    });

    it("does not put the action bar wrapper itself in the tab order", () => {
      cy.mount(<BottomBandMegaMenu />);
      openSolutions();

      cy.get(".saltMegaMenuSupportingActions").should(
        "not.have.attr",
        "tabindex",
      );
    });
  });

  describe("when the menu has static-only content", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("excludes a static-only region and action bar from the Tab sequence", () => {
      cy.mount(<StaticContentMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management (last real cell)
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // The static region/action bar contribute no cells, so Tab exits the menu.
      cy.realPress("Tab");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "After Nav" }).should("be.focused");
    });

    it("does not cross into static content with arrow keys", () => {
      cy.mount(<StaticContentMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management (last item; static action bar below)
      cy.realPress("ArrowDown"); // no action bar cell below → no effect
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Static region carries no cells, so it is not a column to cross into;
      // Right in the last column wraps to the trigger instead of entering it.
      cy.realPress("ArrowRight");
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
        input.setSelectionRange(input.value.length, input.value.length);
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

    it("still advances Tab and Shift+Tab across a control to neighbouring cells", () => {
      cy.mount(<RoleAwareTabMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // Tab is never yielded — it moves from the input to the next cell.
      cy.findByRole("textbox", { name: "Search" }).focus();
      cy.realPress("Tab");
      cy.findByRole("link", { name: "Go" }).should("be.focused");

      // Shift+Tab moves from the input back to the previous cell.
      cy.findByRole("textbox", { name: "Search" }).focus();
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });
  });
});
