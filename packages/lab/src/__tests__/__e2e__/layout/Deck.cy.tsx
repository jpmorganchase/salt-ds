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
        .should("have.class", "uitkDeckItem-current");
      cy.get(".uitkDeckItem").eq(1).should("have.class", "uitkDeckItem-next");
    });
  });
  describe("WHEN an active index is provided", () => {
    it("THEN it should render in right DeckItem", () => {
      cy.mount(<DefaultDeckLayout activeIndex={1} />);
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-current");
    });
    it("THEN it should navigate trough items", () => {
      cy.mount(<DefaultDeckLayout activeIndex={1} animation="slide" />);
      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-previous");
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-current");
      cy.get(".uitkDeckItem").eq(2).should("have.class", "uitkDeckItem-next");

      cy.findByRole("button", {
        name: "Previous",
      }).realClick();

      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-current");
      cy.get(".uitkDeckItem").eq(1).should("have.class", "uitkDeckItem-next");

      cy.findByRole("button", {
        name: "Next",
      }).realClick();
      cy.findByRole("button", {
        name: "Next",
      }).realClick();

      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-previous");
      cy.get(".uitkDeckItem")
        .eq(2)
        .should("have.class", "uitkDeckItem-current");
      cy.get(".uitkDeckItem").eq(3).should("have.class", "uitkDeckItem-next");
    });
  });
  describe("WHEN animation and direction values are provided", () => {
    it("THEN items should have animation classes top to bottom if direction is vertical", () => {
      cy.mount(<DefaultDeckLayout direction="vertical" animation="slide" />);
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-out-top");
      cy.findByRole("button", {
        name: "Next",
      }).realClick();
      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-slide-out-top");
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-in-bottom");
      cy.get(".uitkDeckItem")
        .eq(2)
        .should("have.class", "uitkDeckItem-slide-out-top");
    });
    it("THEN items should have animation classes left to right if direction is horizontal", () => {
      cy.mount(<DefaultDeckLayout animation="slide" />);
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-out-left");
      cy.findByRole("button", {
        name: "Next",
      }).realClick();
      cy.get(".uitkDeckItem")
        .eq(0)
        .should("have.class", "uitkDeckItem-slide-out-left");
      cy.get(".uitkDeckItem")
        .eq(1)
        .should("have.class", "uitkDeckItem-slide-in-right");
      cy.get(".uitkDeckItem")
        .eq(2)
        .should("have.class", "uitkDeckItem-slide-out-left");
    });
  });
});
