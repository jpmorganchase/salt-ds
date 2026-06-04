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

// Fixture mirroring the documented best-practice structure:
// - triggers wrapped in a `<nav>` landmark
// - triggers grouped in an `<ol>` with each trigger inside an `<li>`
// - each `MegaMenuPanel` given an `aria-label` describing its content
const AccessibleMegaMenu = () => (
  <nav aria-label="Main">
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
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem
                  href="/patient-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Patient Management
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
          <MegaMenuPanel aria-label="Services menu">
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Consulting</MegaMenuHeader>
                <MegaMenuItem
                  href="/strategy"
                  onClick={(e) => e.preventDefault()}
                >
                  Strategy
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// All four content positions around the groups, to verify the panel assigns
// grid areas purely from component type and source order (no placement props).
const LayoutMegaMenu = () => (
  <nav aria-label="Main">
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu defaultOpen>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuBand>
              <a href="/top">Top band link</a>
            </MegaMenuBand>
            <MegaMenuRegion>
              <a href="/left">Left region link</a>
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
              </MegaMenuGroup>
            </MegaMenuGroups>
            <MegaMenuRegion>
              <a href="/right">Right region link</a>
            </MegaMenuRegion>
            <MegaMenuBand>
              <a href="/bottom">Bottom band link</a>
            </MegaMenuBand>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

describe("Given a MegaMenu", () => {
  describe("navigation landmark and trigger structure", () => {
    it("exposes the triggers within a navigation landmark and a list", () => {
      cy.mount(<AccessibleMegaMenu />);

      // The triggers are reachable through the `<nav>` landmark...
      cy.findByRole("navigation", { name: "Main" })
        .findByRole("button", { name: "Solutions" })
        .should("exist");

      // ...and grouped in an `<ol>` (list) with each trigger inside an `<li>`.
      cy.findByRole("navigation", { name: "Main" })
        .findByRole("list")
        .findAllByRole("listitem")
        .should("have.length", 2);
    });
  });

  describe("trigger aria attributes", () => {
    it("reflects the collapsed state with aria-expanded=false and no aria-controls", () => {
      cy.mount(<AccessibleMegaMenu />);

      cy.findByRole("button", { name: "Solutions" })
        .should("have.attr", "aria-expanded", "false")
        .and("not.have.attr", "aria-controls");
    });

    it("sets aria-expanded=true and aria-controls referencing the panel when open", () => {
      cy.mount(<AccessibleMegaMenu />);

      cy.findByRole("button", { name: "Solutions" }).click();

      cy.findByRole("button", { name: "Solutions" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

      // aria-controls must point at the rendered panel (role="region").
      cy.findByRole("button", { name: "Solutions" })
        .invoke("attr", "aria-controls")
        .then((panelId) => {
          expect(panelId, "aria-controls is set").to.be.a("string").and.not.be
            .empty;
          // Use an attribute selector — generated ids can contain colons,
          // which are invalid in a `#id` CSS selector.
          cy.get(`[id="${panelId}"]`)
            .should("have.attr", "role", "region")
            .and("have.class", "saltMegaMenuPanel");
        });
    });

    it("clears aria-expanded back to false after closing", () => {
      cy.mount(<AccessibleMegaMenu />);

      cy.findByRole("button", { name: "Solutions" }).click();
      cy.findByRole("button", { name: "Solutions" }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );

      cy.findByRole("button", { name: "Solutions" }).click();
      cy.findByRole("button", { name: "Solutions" })
        .should("have.attr", "aria-expanded", "false")
        .and("not.have.attr", "aria-controls");
    });
  });

  describe("panel region semantics", () => {
    it("renders the panel as a region with the provided aria-label", () => {
      cy.mount(<AccessibleMegaMenu />);

      cy.findByRole("button", { name: "Solutions" }).click();

      cy.findByRole("region", { name: "Solutions menu" })
        .should("exist")
        .and("have.class", "saltMegaMenuPanel");
    });

    it("gives each panel a distinct accessible name", () => {
      cy.mount(<AccessibleMegaMenu />);

      cy.findByRole("button", { name: "Services" }).click();
      cy.findByRole("region", { name: "Services menu" }).should("exist");
      cy.findByRole("region", { name: "Solutions menu" }).should("not.exist");
    });
  });

  describe("group list semantics", () => {
    it("exposes each group as a list named after its header", () => {
      cy.mount(<AccessibleMegaMenu />);

      cy.findByRole("button", { name: "Solutions" }).click();

      // Each group renders a `<ul>` (role="list") whose accessible name is
      // derived from the group header via aria-labelledby.
      cy.findByRole("list", { name: "Financial Services" })
        .findAllByRole("listitem")
        .should("have.length", 2);

      cy.findByRole("list", { name: "Healthcare" })
        .findAllByRole("listitem")
        .should("have.length", 1);
    });
  });

  describe("keyboard focus boundaries", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("collapses the menu and moves focus out when Tab passes the last item", () => {
      cy.mount(<AccessibleMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management (last focusable)
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );

      cy.realPress("Tab");
      // Menu collapses and focus lands on the next trigger outside the panel.
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("returns focus to the trigger when Shift+Tab passes the first item, keeping the menu open", () => {
      cy.mount(<AccessibleMegaMenu />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking (first focusable)
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("closes and returns focus to the trigger on Escape", () => {
      cy.mount(<AccessibleMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("degrades arrows to a linear walk when the grid is stacked at a small viewport", () => {
      cy.viewport(375, 667);
      cy.mount(<AccessibleMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      // Within the first group.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      // Stacked: ArrowDown crosses the group boundary linearly rather than
      // stopping at the column edge (which is the side-by-side behaviour).
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Patient Management" }).should(
        "be.focused",
      );

      // ArrowUp walks back up the same linear order.
      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");
    });

    it("returns focus to the trigger on ArrowUp from the first item when stacked", () => {
      cy.viewport(375, 667);
      cy.mount(<AccessibleMegaMenu />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });
  });

  describe("panel layout (source-order positioning)", () => {
    it("assigns grid areas from component type and source order", () => {
      cy.mount(<LayoutMegaMenu />);

      cy.contains(".saltMegaMenuBand", "Top band link")
        .should("have.attr", "style")
        .and("match", /grid-area:\s*top/);
      cy.contains(".saltMegaMenuRegion", "Left region link")
        .should("have.attr", "style")
        .and("match", /grid-area:\s*left/);
      cy.contains(".saltMegaMenuGroups", "Digital Banking")
        .should("have.attr", "style")
        .and("match", /grid-area:\s*center/);
      cy.contains(".saltMegaMenuRegion", "Right region link")
        .should("have.attr", "style")
        .and("match", /grid-area:\s*right/);
      cy.contains(".saltMegaMenuBand", "Bottom band link")
        .should("have.attr", "style")
        .and("match", /grid-area:\s*bottom/);
    });
  });

  describe("axe checks", () => {
    it("has no detectable a11y violations when closed", () => {
      cy.mount(<AccessibleMegaMenu />);
      cy.checkAxeComponent();
    });

    it("has no detectable a11y violations when open", () => {
      cy.mount(<AccessibleMegaMenu />);
      cy.findByRole("button", { name: "Solutions" }).click();
      cy.findByRole("region", { name: "Solutions menu" }).should("exist");
      cy.checkAxeComponent();
    });

    it("has no detectable a11y violations with regions and bands open", () => {
      cy.mount(<LayoutMegaMenu />);
      cy.findByRole("region", { name: "Solutions menu" }).should("exist");
      cy.checkAxeComponent();
    });
  });
});
