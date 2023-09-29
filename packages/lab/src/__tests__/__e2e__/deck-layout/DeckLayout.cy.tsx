import { composeStories } from "@storybook/react";
import * as deckStories from "@stories/deck-layout/deck-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(deckStories);
const { Default } = composedStories;

describe("Given a deck layout", () => {
  checkAccessibility(composedStories);

  describe("WHEN no custom values are provided", () => {
    it("THEN it should render with default values", () => {
      cy.mount(<Default />);
      cy.get(".saltDeckItem").should("have.length", 6);
      cy.get(".saltDeckItem")
        .eq(0)
        .should("have.class", "saltDeckItem-static-current");
      cy.get(".saltDeckItem")
        .eq(1)
        .should("have.class", "saltDeckItem-static-next");
    });
  });
  describe("WHEN an active index is provided", () => {
    it("THEN it should render in right DeckItem", () => {
      cy.mount(<Default activeIndex={1} />);
      cy.get(".saltDeckItem")
        .eq(1)
        .should("have.class", "saltDeckItem-static-current");
    });
    it("THEN it should navigate trough items", () => {
      cy.mount(<Default activeIndex={1} animation="slide" />);
      cy.get(".saltDeckItem")
        .eq(0)
        .should("have.class", "saltDeckItem-slide-previous");
      cy.get(".saltDeckItem")
        .eq(1)
        .should("have.class", "saltDeckItem-slide-current");
      cy.get(".saltDeckItem")
        .eq(2)
        .should("have.class", "saltDeckItem-slide-next");

      cy.findByRole("button", {
        name: "Previous",
      }).realClick();

      cy.get(".saltDeckItem")
        .eq(0)
        .should("have.class", "saltDeckItem-slide-current");
      cy.get(".saltDeckItem")
        .eq(1)
        .should("have.class", "saltDeckItem-slide-next");

      cy.findByRole("button", {
        name: "Next",
      }).realClick();
      cy.findByRole("button", {
        name: "Next",
      }).realClick();

      cy.get(".saltDeckItem")
        .eq(1)
        .should("have.class", "saltDeckItem-slide-previous");
      cy.get(".saltDeckItem")
        .eq(2)
        .should("have.class", "saltDeckItem-slide-current");
      cy.get(".saltDeckItem")
        .eq(3)
        .should("have.class", "saltDeckItem-slide-next");
    });
  });
  describe("WHEN animation and direction values are provided", () => {
    it("THEN deck should have vertical animation classes if direction is vertical", () => {
      cy.mount(<Default direction="vertical" animation="slide" />);

      cy.get(".saltDeckLayout-animate").should(
        "have.class",
        "saltDeckLayout-slide-vertical"
      );
    });
    it("THEN deck should have horizontal animation classes if direction is horizontal", () => {
      cy.mount(<Default animation="slide" />);
      cy.get(".saltDeckLayout-animate").should(
        "have.class",
        "saltDeckLayout-slide-horizontal"
      );
    });
  });
});
