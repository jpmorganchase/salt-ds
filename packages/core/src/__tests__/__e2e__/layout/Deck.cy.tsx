import { composeStories } from "@storybook/testing-react";
import * as deckStories from "@stories/layout/deck-layout.stories";

const composedStories = composeStories(deckStories);
const { DefaultDeckLayout } = composedStories;

describe("Given a deck layout", () => {
  describe("WHEN no custom values are provided", () => {
    it("THEN it should render with default values", () => {
      cy.mount(<DefaultDeckLayout />);
      cy.get(".uitkDeckItem").should("have.length", 6);
      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-static-current");
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-static-next");
    });
  });
  describe("WHEN an active index is provided", () => {
    it("THEN it should render in right DeckItem", () => {
      cy.mount(<DefaultDeckLayout activeIndex={1} />);
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-static-current");
    });
    it("THEN it should navigate trough items", () => {
      cy.mount(<DefaultDeckLayout activeIndex={1} animation="slide" />);
      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-slide-previous");
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-current");
      cy.get(".uitkDeckItem")
        .eq(2)
        .should("have.class", "uitkDeckItem-slide-next");

      cy.findByRole("button", {
        name: "Previous",
      }).realClick();

      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-slide-current");
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-next");

      cy.findByRole("button", {
        name: "Next",
      }).realClick();
      cy.findByRole("button", {
        name: "Next",
      }).realClick();

      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-previous");
      cy.get(".uitkDeckItem")
        .eq(2)
        .should("have.class", "uitkDeckItem-slide-current");
      cy.get(".uitkDeckItem")
        .eq(3)
        .should("have.class", "uitkDeckItem-slide-next");
    });
  });
  describe("WHEN animation and direction values are provided", () => {
    it("THEN deck should have vertical animation classes if direction is vertical", () => {
      cy.mount(<DefaultDeckLayout direction="vertical" animation="slide" />);

      cy.get(".uitkDeckLayout-animate").should(
        "have.class",
        "uitkDeckLayout-slide-vertical"
      );
    });
    it("THEN deck should have horizontal animation classes if direction is horizontal", () => {
      cy.mount(<DefaultDeckLayout animation="slide" />);
      cy.get(".uitkDeckLayout-animate").should(
        "have.class",
        "uitkDeckLayout-slide-horizontal"
      );
    });
  });
});
