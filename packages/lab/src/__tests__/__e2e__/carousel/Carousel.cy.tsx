import * as carouselStories from "@stories/carousel/carousel.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(carouselStories);
const { Default } = composedStories;
describe("GIVEN a 100% width slides carousel", () => {
  checkAccessibility(composedStories);
  describe("WHEN the default is rendered with slides", () => {
    it("SHOULD render carousel", () => {
      cy.mount(<Default />);
    });
  });
  describe("WHEN moving slides with buttons", () => {
    it("SHOULD move to the next slide with button", () => {
      cy.mount(<Default />);
      cy.findByText("1 of 5").should("exist");
      cy.findAllByRole("button").eq(0).should("be.disabled");
      cy.findAllByRole("button").eq(1).click();
      cy.findByText("2 of 5").should("exist");
    });

    it("SHOULD move to the previous slide with button", () => {
      cy.mount(<Default />);
      // move one to the left
      cy.findAllByRole("button").eq(1).click();
      // test back button
      cy.findAllByRole("button").eq(0).click();
      cy.findByText("1 of 5").should("exist");
    });
    it("SHOULD update labels when scrolling", () => {
      cy.mount(<Default />);
      cy.findByText("1 of 5").should("exist");
      cy.get(".saltCarouselSlider").scrollTo("100%");
      cy.findByText("5 of 5").should("exist");
    });
    it("SHOULD support keyboard navigation", () => {
      cy.mount(<Default />);
      cy.get(".saltCarouselSlider").focus().realPress("ArrowRight");
      cy.findByText("2 of 5").should("exist");
      cy.get(".saltCarouselSlider").realPress("ArrowLeft");
      cy.findByText("1 of 5").should("exist");
    });
    // TODO: test navigation when actions (tab goes in, tab after that doesnt move slides)
  });
});
describe("GIVEN a carousel with responsive visibleItems", () => {
  it.only("SHOULD render properly with different visible items based on viewport", () => {
    cy.viewport(590, 900); // xs viewport
    cy.mount(<Default visibleSlides={{ xs: 1, sm: 2, md: 3 }} />);
    cy.findByText("1 of 5").should("exist");

    cy.viewport(700, 900); // sm viewport
    cy.mount(<Default visibleSlides={{ xs: 1, sm: 2, md: 3 }} />);
    cy.findByText("1 - 2 of 5").should("exist");

    cy.viewport(961, 1200); // md viewport
    cy.mount(<Default visibleSlides={{ xs: 1, sm: 2, md: 3 }} />);
    cy.findByText("1 - 3 of 5").should("exist");
  });
});
