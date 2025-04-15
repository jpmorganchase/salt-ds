import * as carouselStories from "@stories/carousel/carousel.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(carouselStories);
const { Default, WithActions, Controlled } = composedStories;
describe("GIVEN a 100% width slides carousel", () => {
  checkAccessibility(composedStories);
  describe("WHEN the default is rendered with slides", () => {
    it("SHOULD render carousel", () => {
      cy.mount(<Default />);
      cy.findByRole("region").should("exist");
    });
  });
  describe("WHEN moving slides with buttons", () => {
    it("SHOULD move to the next slide with button", () => {
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByRole("button", { name: "Previous slide" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("2 of 4").should("exist");
    });

    it("SHOULD move to the previous slide with button", () => {
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      // move one to the left
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("2 of 4").should("exist");
      // test back button
      cy.findAllByRole("button", { name: "Previous slide" }).click();
      cy.findAllByText("1 of 4").should("exist");
    });
    it("SHOULD disable previous button when reaching far left", () => {
      cy.mount(<Default defaultActiveSlideIndex={1} />);
      cy.findAllByText("2 of 4").should("exist");
      cy.findAllByRole("button", { name: "Previous slide" }).click();
      cy.findAllByRole("button", { name: "Previous slide" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
    });

    it("SHOULD disable next button when reaching far right", () => {
      cy.mount(<Default defaultActiveSlideIndex={2} />);
      cy.findAllByText("3 of 4").should("exist");
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("4 of 4").should("exist");
      cy.findAllByRole("button", { name: "Next slide" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
    });
    it.skip("SHOULD update labels when scrolling", () => {
      // flaky with react 16/17
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      cy.get(".saltCarouselSlider").scrollTo("right");
      cy.wait(100);
      cy.findAllByText("4 of 4").should("exist");
    });
    it("SHOULD support keyboard navigation", () => {
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByRole("group").get('[tabindex="0"]').focus();
      cy.findAllByRole("group").get('[tabindex="0"]').realPress("ArrowRight");
      cy.findAllByText("2 of 4").should("exist");
      cy.wait(100);
      cy.findAllByRole("group").get('[tabindex="0"]').realPress("ArrowLeft");
      cy.findAllByText("1 of 4").should("exist");
    });
    describe("WHEN navigating with keyboard keys", () => {
      it("SHOULD NOT move to hidden slides when using tab navigation", () => {
        cy.mount(<WithActions />);
        cy.findAllByText("1 - 2 of 4").should("exist");
        cy.findAllByRole("button", { name: "Next slides" }).focus();
        // tab through visible elements
        cy.realPress("Tab");
        cy.realPress("Tab");
        cy.findByText("Open an account").should("be.focused");
        cy.realPress("Tab");
        cy.realPress("Tab");
        cy.findByText("Go to dashboard").should("be.focused");
        // next tab should exit the carousel
        cy.realPress("Tab");
        // slides should not have been changed
        cy.findAllByText("1 - 2 of 4").should("exist");
      });
    });
  });
});
describe("GIVEN a carousel with responsive visibleItems", () => {
  it("SHOULD render properly with different visible items based on viewport", () => {
    cy.viewport(590, 900); // xs viewport
    cy.mount(<Default visibleSlides={{ xs: 1, sm: 2, md: 3 }} />);
    cy.findAllByText("1 of 4").should("exist");

    cy.viewport(700, 900); // sm viewport
    cy.mount(<Default visibleSlides={{ xs: 1, sm: 2, md: 3 }} />);
    cy.findAllByText("1 - 2 of 4").should("exist");

    cy.viewport(961, 1200); // md viewport
    cy.mount(<Default visibleSlides={{ xs: 1, sm: 2, md: 3 }} />);
    cy.findAllByText("1 - 3 of 4").should("exist");
  });
});
describe("WHEN mounted as an uncontrolled component", () => {
  it("THEN should move slide when controlled slide index is passed", () => {
    cy.mount(<Controlled />);
    cy.findAllByRole("button", { name: "Right" }).click();
    cy.findByText("Current slide: 2").should("exist");
    cy.findAllByRole("button", { name: "Left" }).click();
    cy.findByText("Current slide: 1").should("exist");
  });
  it("THEN should be able to update controlled value when navigating slider", () => {
    cy.mount(<Controlled />);
    cy.findByText("Current slide: 1").should("exist");
    cy.findAllByRole("group").get('[tabindex="0"]').focus();
    cy.findAllByRole("group").get('[tabindex="0"]').realPress("ArrowRight");
    cy.findByText("Current slide: 2").should("exist");
  });
});
