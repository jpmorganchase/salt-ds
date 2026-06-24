import * as megaMenuStories from "@stories/mega-menu/mega-menu.stories";
import { composeStories } from "@storybook/react-vite";

const {
  Baseline,
  WithRegionsLayout,
  WithCustomHeadingId,
  WithoutGroupHeading,
  WithExtraGroupLabel,
  WithCurrentItem,
} = composeStories(megaMenuStories);

describe("Given a MegaMenu", () => {
  describe("navigation landmark and trigger structure", () => {
    it("exposes the triggers within a navigation landmark and a list", () => {
      cy.mount(<Baseline />);

      // The triggers are reachable through the `<nav>` landmark...
      cy.findByRole("navigation", { name: "Main" })
        .findByRole("button", { name: "Solutions" })
        .should("exist");

      // ...and grouped in a `<ul>` (list) with each trigger inside an `<li>`.
      cy.findByRole("navigation", { name: "Main" })
        .findByRole("list")
        .findAllByRole("listitem")
        .should("have.length", 2);
    });
  });

  describe("trigger aria attributes", () => {
    it("reflects the collapsed state with aria-expanded=false and no aria-controls", () => {
      cy.mount(<Baseline />);

      cy.findByRole("button", { name: "Solutions" })
        .should("have.attr", "aria-expanded", "false")
        .and("not.have.attr", "aria-controls");
    });

    it("sets aria-expanded=true and aria-controls referencing the panel when open", () => {
      cy.mount(<Baseline />);

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
      cy.mount(<Baseline />);

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
      cy.mount(<Baseline />);

      cy.findByRole("button", { name: "Solutions" }).click();

      cy.findByRole("region", { name: "Solutions menu" })
        .should("exist")
        .and("have.class", "saltMegaMenuPanel");
    });

    it("gives each panel a distinct accessible name", () => {
      cy.mount(<Baseline />);

      cy.findByRole("button", { name: "Services" }).click();
      cy.findByRole("region", { name: "Services menu" }).should("exist");
      cy.findByRole("region", { name: "Solutions menu" }).should("not.exist");
    });
  });

  describe("group list semantics", () => {
    it("exposes each group as a list named after its header", () => {
      cy.mount(<Baseline />);

      cy.findByRole("button", { name: "Solutions" }).click();

      // Each group renders a `<ul>` (role="list") whose accessible name is
      // derived from the group header via aria-labelledby.
      cy.findByRole("list", { name: "Financial Services" })
        .findAllByRole("listitem")
        .should("have.length", 2);

      cy.findByRole("list", { name: "Healthcare" })
        .findAllByRole("listitem")
        .should("have.length", 2);
    });

    it("honours a consumer-provided heading id and labels the list with it", () => {
      cy.mount(<WithCustomHeadingId />);

      // The heading wears the consumer's id...
      cy.get('[id="custom-heading-id"]').should(
        "contain.text",
        "Financial Services",
      );
      // ...and the list is labelled by exactly that id (not an internal one).
      cy.findByRole("list", { name: "Financial Services" }).should(
        "have.attr",
        "aria-labelledby",
        "custom-heading-id",
      );
    });

    it("omits aria-labelledby when the group has no heading", () => {
      cy.mount(<WithoutGroupHeading />);

      // No heading means no label target — the attribute must be absent, not a
      // dangling reference to a non-existent id.
      cy.findByRole("list").should("not.have.attr", "aria-labelledby");
    });

    it("combines the group heading with a consumer-provided aria-labelledby", () => {
      cy.mount(<WithExtraGroupLabel />);

      // The accessible name concatenates the heading and the consumer's element,
      // heading first.
      cy.findByRole("list", {
        name: "Financial Services Recommended",
      }).should("exist");
    });
  });

  describe("current item semantics", () => {
    it("marks the item with the `current` prop as aria-current=page", () => {
      cy.mount(<WithCurrentItem />);

      cy.findByRole("link", { name: "Digital Banking" }).should(
        "have.attr",
        "aria-current",
        "page",
      );
    });

    it("leaves other items without aria-current", () => {
      cy.mount(<WithCurrentItem />);

      cy.findByRole("link", { name: "Risk Management" }).should(
        "not.have.attr",
        "aria-current",
      );
    });
  });

  describe("keyboard focus boundaries", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("collapses the menu and moves focus out when Tab passes the last item", () => {
      cy.mount(<Baseline />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management
      cy.realPress("Tab"); // Telemedicine (last focusable)
      cy.findByRole("link", { name: "Telemedicine" }).should("be.focused");

      cy.realPress("Tab");
      // Menu collapses and focus lands on the next trigger outside the panel.
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
    });

    it("returns focus to the trigger when Shift+Tab passes the first item, keeping the menu open", () => {
      cy.mount(<Baseline />);
      openSolutions();

      cy.realPress("Tab"); // Digital Banking (first focusable)
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("closes and returns focus to the trigger on Escape", () => {
      cy.mount(<Baseline />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("degrades arrows to a linear walk when the grid is stacked at a small viewport", () => {
      cy.viewport(375, 667);
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
      openSolutions();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });
  });

  describe("panel layout (source-order positioning)", () => {
    it("places content regions around the body and the action bar inside it, from source order", () => {
      cy.mount(<WithRegionsLayout />);

      // The panel is a single row whose direct children are, in source order,
      // the left content region, the center (body), and the right content region.
      cy.get(".saltMegaMenuPanel")
        .children()
        .then(($children) => {
          const classes = [...$children].map((el) => el.classList[0]);
          expect(classes).to.deep.equal([
            "saltMegaMenuAside",
            "saltMegaMenuContent",
            "saltMegaMenuAside",
          ]);
        });

      // The content region before the body carries the left content; the one after, the right.
      cy.contains(".saltMegaMenuPanel > .saltMegaMenuAside", "Left region link")
        .next()
        .should("have.class", "saltMegaMenuContent");
      cy.contains(
        ".saltMegaMenuPanel > .saltMegaMenuAside",
        "Right region link",
      )
        .prev()
        .should("have.class", "saltMegaMenuContent");

      // The action bar lives inside the body, beneath the groups (never beside the
      // content regions, which are outside the body).
      cy.contains(".saltMegaMenuContent", "Digital Banking")
        .find(".saltMegaMenuActions")
        .should("contain.text", "Bottom band link");
    });
  });

  describe("axe checks", () => {
    it("has no detectable a11y violations when closed", () => {
      cy.mount(<Baseline />);
      cy.checkAxeComponent();
    });

    it("has no detectable a11y violations when open", () => {
      cy.mount(<Baseline />);
      cy.findByRole("button", { name: "Solutions" }).click();
      cy.findByRole("region", { name: "Solutions menu" }).should("exist");
      cy.checkAxeComponent();
    });

    it("has no detectable a11y violations with content regions and an action bar open", () => {
      cy.mount(<WithRegionsLayout />);
      cy.findByRole("region", { name: "Solutions menu" }).should("exist");
      cy.checkAxeComponent();
    });
  });
});
