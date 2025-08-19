import * as cascadingMenuStories from "@stories/cascading-menu/cascading-menu.stories";
import { composeStories } from "@storybook/react-vite";
import { version } from "react";

const { Default } = composeStories(cascadingMenuStories);

describe("GIVEN a CascadingMenu component", () => {
  describe("WHEN it initially renders", () => {
    it("THEN the content alone will render", () => {
      cy.mount(<Default />);
      cy.findByTestId("cascading-menu-trigger").should(
        "have.class",
        "saltButton",
      );
      cy.findByRole("menu").should("not.exist");
    });
  });

  describe("WHEN trigger element is clicked", () => {
    it("THEN the menu will be displayed", () => {
      cy.mount(<Default />);
      cy.findByTestId("cascading-menu-trigger").click();
      cy.findAllByRole("menu").should("have.length", 1);
    });
  });

  describe("WHEN trigger element is focussed", () => {
    it("THEN the menu will not be displayed", () => {
      cy.mount(<Default />);
      cy.findByTestId("cascading-menu-trigger").focus();
      cy.findAllByRole("menu").should("have.length", 0);
    });

    describe("AND arrow down is pressed", () => {
      it("THEN the menu will be displayed", () => {
        cy.mount(<Default />);
        cy.findByTestId("cascading-menu-trigger").focus();
        cy.realPress("{downarrow}");
        cy.findAllByRole("menu").should("have.length", 1);
      });
      describe("AND ENTER is pressed on MenuItem with sub-items", () => {
        it("THEN the submenu will be displayed", () => {
          cy.mount(<Default />);
          cy.findByTestId("cascading-menu-trigger").focus();
          cy.realPress("{downarrow}");
          cy.realPress("{enter}");
          cy.findAllByRole("menu").should("have.length", 2);
        });
      });
    });
  });

  describe("Sub menus navigation", () => {
    specify(
      "By Enter key",
      // Unstable in React 18
      !version.startsWith("18")
        ? () => {
            cy.mount(<Default />);
            cy.findByTestId("cascading-menu-trigger").focus();
            cy.realPress("{downarrow}");
            cy.realPress("{enter}");
            cy.realPress("{downarrow}");
            cy.realPress("{enter}");
            cy.findAllByRole("menu").should("have.length", 3);
          }
        : undefined,
    );

    specify(
      "By Right Arrow key",
      // Unstable in React 18
      !version.startsWith("18")
        ? () => {
            cy.mount(<Default />);
            cy.findByTestId("cascading-menu-trigger").focus();
            cy.realPress("{downarrow}");
            cy.realPress("{rightarrow}");
            cy.realPress("{downarrow}");
            cy.realPress("{rightarrow}");
            cy.findAllByRole("menu").should("have.length", 3);
          }
        : undefined,
    );

    specify(
      "Escape closes on 'topmost' menu",
      // Unstable in React 18
      !version.startsWith("18")
        ? () => {
            cy.mount(<Default />);
            cy.findByTestId("cascading-menu-trigger").focus();
            cy.realPress("{downarrow}");
            cy.realPress("{rightarrow}");
            cy.realPress("{downarrow}");
            cy.realPress("{rightarrow}");
            cy.findAllByRole("menu").should("have.length", 3);
            cy.realPress("Escape");
            cy.findAllByRole("menu").should("have.length", 2);
            cy.realPress("Escape");
            cy.findAllByRole("menu").should("have.length", 1);
            cy.realPress("Escape");
            cy.findAllByRole("menu").should("have.length", 0);
          }
        : undefined,
    );

    specify("Click-away closes all menus", () => {
      cy.mount(<Default />);
      cy.findByTestId("cascading-menu-trigger").focus();
      cy.realPress("{downarrow}");
      cy.realPress("{rightarrow}");
      cy.realPress("{downarrow}");
      cy.realPress("{rightarrow}");
      cy.get("body").click();
      cy.findAllByRole("menu").should("have.length", 0);
    });
  });

  describe("Focus management", () => {
    specify("Focus shifts from trigger to 'topmost' menu", () => {
      cy.mount(<Default />);
      cy.findByTestId("cascading-menu-trigger").focus();
      cy.focused().should("have.class", "saltButton");
      cy.realPress("{downarrow}");
      cy.focused().should("have.class", "saltCascadingMenuList");
    });
  });
});
