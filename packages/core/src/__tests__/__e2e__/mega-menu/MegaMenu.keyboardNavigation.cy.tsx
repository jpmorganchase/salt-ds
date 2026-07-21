import * as megaMenuStories from "@stories/mega-menu/mega-menu.stories";
import { composeStories } from "@storybook/react-vite";

const {
  Baseline,
  WithAside,
  WithLeadingAside,
  WithActions,
  WithActionsAndNextTrigger,
  StaticContent,
  WithActionItem,
  WithRenderProp,
} = composeStories(megaMenuStories);

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
        cy.mount(<Baseline />);
        focusSolutionsTrigger();
        cy.realPress(key);
        cy.get(".saltMegaMenuPanel").should("exist");
      });
    });

    it("does not open on Tab", () => {
      cy.mount(<Baseline />);
      focusSolutionsTrigger();
      cy.realPress("Tab");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("moves focus to next trigger on ArrowRight", () => {
      cy.mount(<Baseline />);
      focusSolutionsTrigger();

      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("moves focus to previous trigger on ArrowLeft", () => {
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("moves focus to first item on ArrowDown from trigger", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("ArrowRight on an open trigger closes the panel and moves to the next trigger", () => {
      cy.mount(<Baseline />);
      // Focus stays on the trigger after opening with Enter.
      openSolutionsWithEnter();
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");

      cy.realPress("ArrowRight");
      cy.findByRole("button", { name: "Services" }).should("be.focused");
      // The previously-open Solutions panel must collapse.
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("ArrowLeft on an open trigger closes the panel and moves to the previous trigger", () => {
      cy.mount(<Baseline />);
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("Shift+Tab on an open trigger closes the panel and moves to the previous trigger", () => {
      cy.mount(<Baseline />);
      cy.findByRole("button", { name: "Services" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
      cy.findByRole("button", { name: "Services" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("re-enters items on ArrowDown after ArrowUp returns to trigger (opened via ArrowDown)", () => {
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowLeft on the first column returns focus to the trigger and keeps the menu open", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuPanel").should("exist");
    });

    it("ArrowDown from the bottom of the last column is a no-op when there is no next trigger", () => {
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("returns focus to trigger on Shift+Tab from first item and Tab re-enters first item", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("activates item on Enter and closes menu", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("not.exist");
    });

    it("does not activate an item on Space (links activate on Enter only)", () => {
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
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
      cy.mount(<Baseline />);
      focusSolutionsTrigger();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // Focus has not yet moved into the panel — Escape should still dismiss it.
      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("supports Home to jump to first item in column", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("ArrowDown"); // Risk Management
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");

      cy.realPress("Home");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("supports End to jump to last item in column", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("End");
      cy.findByRole("link", { name: "Risk Management" }).should("be.focused");
    });

    it("returns focus to trigger on Escape", () => {
      cy.mount(<Baseline />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");

      cy.realPress("Escape");
      cy.get(".saltMegaMenuPanel").should("not.exist");
      cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    });

    it("renders an action item (render={<button/>}) as a focusable button", () => {
      cy.mount(<WithActionItem />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      // ArrowDown lands on the action item, rendered as a focusable button.
      cy.realPress("ArrowDown");
      cy.findByRole("button", { name: "Action button" }).should("be.focused");

      // ...and continues to the link beneath it.
      cy.realPress("ArrowDown");
      cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    });

    it("treats `render` prop element as the focusable target", () => {
      cy.mount(<WithRenderProp />);
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Digital Banking" })
        .should("be.focused")
        .and("have.attr", "data-custom-link");
    });

    it("renders no duplicate <a> when using `render` (render replaces, not wraps)", () => {
      cy.mount(<WithRenderProp />);
      cy.findByRole("button", { name: "Solutions" }).click();
      // Exactly one anchor for the item — verifies `renderProps` substitutes
      // the host element instead of wrapping it (no link-in-a-link).
      cy.get(".saltMegaMenuPanel a.saltMegaMenuListItem-wrapper").should(
        "have.length",
        1,
      );
    });
  });

  describe("when the menu has a side region", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("includes the region's interactive elements in the Tab sequence, in layout order", () => {
      cy.mount(<WithAside />);
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
      cy.mount(<WithAside />);
      openSolutions();

      cy.get(".saltMegaMenuAside").should("not.have.attr", "tabindex");
    });

    it("crosses into the region column with ArrowRight and within it with ArrowDown", () => {
      cy.mount(<WithAside />);
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
      cy.mount(<WithAside />);
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
      cy.mount(<WithAside />);
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
      cy.mount(<WithLeadingAside />);
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
      cy.mount(<WithActions />);
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
      cy.mount(<WithActions />);
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
      cy.mount(<WithActions />);
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
      cy.mount(<WithActions />);
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
      cy.mount(<WithActionsAndNextTrigger />);
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
      cy.mount(<WithActionsAndNextTrigger />);
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
      cy.mount(<WithActions />);
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
      cy.mount(<WithActions />);
      openSolutions();

      cy.get(".saltMegaMenuActions").should("not.have.attr", "tabindex");
    });
  });

  describe("when the menu has static-only content", () => {
    const openSolutions = () => {
      cy.findByRole("button", { name: "Solutions" }).focus();
      cy.realPress("Enter");
      cy.get(".saltMegaMenuPanel").should("exist");
    };

    it("excludes a static-only region and action bar from the Tab sequence", () => {
      cy.mount(<StaticContent />);
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
      cy.mount(<StaticContent />);
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
});
