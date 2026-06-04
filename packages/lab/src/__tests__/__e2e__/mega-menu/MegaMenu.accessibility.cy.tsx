import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuAside,
  MegaMenuFooter,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuMain,
  MegaMenuPanel,
  MegaMenuSection,
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
            <MegaMenuMain>
              <MegaMenuSection>
                <MegaMenuHeading>Financial Services</MegaMenuHeading>
                <MegaMenuLink
                  href="/digital-banking"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuLink>
                <MegaMenuLink
                  href="/risk-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Risk Management
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Healthcare</MegaMenuHeading>
                <MegaMenuLink
                  href="/patient-management"
                  onClick={(e) => e.preventDefault()}
                >
                  Patient Management
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuMain>
          </MegaMenuPanel>
        </MegaMenu>
      </li>

      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Services menu">
            <MegaMenuMain>
              <MegaMenuSection>
                <MegaMenuHeading>Consulting</MegaMenuHeading>
                <MegaMenuLink
                  href="/strategy"
                  onClick={(e) => e.preventDefault()}
                >
                  Strategy
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuMain>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Asides flanking the center and a footer inside it, to verify the panel
// derives position purely from component type and source order (no placement
// props): an aside before `MegaMenuMain` is the left column, one after is the
// right column, and the footer sits inside `MegaMenuMain` beneath the sections.
const LayoutMegaMenu = () => (
  <nav aria-label="Main">
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu defaultOpen>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuAside>
              <a href="/left">Left region link</a>
            </MegaMenuAside>
            <MegaMenuMain>
              <MegaMenuSection>
                <MegaMenuHeading>Financial Services</MegaMenuHeading>
                <MegaMenuLink
                  href="/digital-banking"
                  onClick={(e) => e.preventDefault()}
                >
                  Digital Banking
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuFooter>
                <a href="/bottom">Bottom band link</a>
              </MegaMenuFooter>
            </MegaMenuMain>
            <MegaMenuAside>
              <a href="/right">Right region link</a>
            </MegaMenuAside>
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
    it("places asides around Main and the footer inside Main, from source order", () => {
      cy.mount(<LayoutMegaMenu />);

      // The panel is a single row whose direct children are, in source order,
      // the left aside, the center (Main), and the right aside.
      cy.get(".saltMegaMenuPanel")
        .children()
        .then(($children) => {
          const classes = [...$children].map((el) => el.classList[0]);
          expect(classes).to.deep.equal([
            "saltMegaMenuAside",
            "saltMegaMenuMain",
            "saltMegaMenuAside",
          ]);
        });

      // The aside before Main carries the left content; the one after, the right.
      cy.contains(".saltMegaMenuPanel > .saltMegaMenuAside", "Left region link")
        .next()
        .should("have.class", "saltMegaMenuMain");
      cy.contains(
        ".saltMegaMenuPanel > .saltMegaMenuAside",
        "Right region link",
      )
        .prev()
        .should("have.class", "saltMegaMenuMain");

      // The footer lives inside Main, beneath the sections (never beside the
      // asides, which are outside Main).
      cy.contains(".saltMegaMenuMain", "Digital Banking")
        .find(".saltMegaMenuFooter")
        .should("contain.text", "Bottom band link");
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

    it("has no detectable a11y violations with asides and a footer open", () => {
      cy.mount(<LayoutMegaMenu />);
      cy.findByRole("region", { name: "Solutions menu" }).should("exist");
      cy.checkAxeComponent();
    });
  });
});
