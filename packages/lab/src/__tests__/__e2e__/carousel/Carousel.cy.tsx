import * as carouselStories from "@stories/carousel/carousel.stories";
import { composeStories } from "@storybook/react-vite";
import { version as reactVersion } from 'react-dom';

const composedStories = composeStories(carouselStories);
const { Default } = composedStories;

describe("GIVEN a carousel", () => {
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
      cy.findAllByText("2 of 4").should("not.exist");
      cy.findAllByRole("button", { name: "Previous slide" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("2 of 4").should("exist");
      cy.findAllByText("1 of 4").should("not.exist");
    });

    it("SHOULD move to the previous slide with button", () => {
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByText("2 of 4").should("not.exist");
      // move one to the left
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("2 of 4").should("exist");
      cy.findAllByText("1 of 4").should("not.exist");
      // test back button
      cy.findAllByRole("button", { name: "Previous slide" }).click();
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByText("2 of 4").should("not.exist");
    });

    it("SHOULD disable previous button when reaching far left", () => {
      cy.mount(<Default />);
      cy.findAllByText("2 of 4").should("exist");
      cy.findAllByRole("button", { name: "Previous slide" }).click();
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByRole("button", { name: "Previous slide" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
    });

    it("SHOULD disable next button when reaching far right", () => {
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("2 of 4").should("exist");
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("3 of 4").should("exist");
      cy.findAllByRole("button", { name: "Next slide" }).click();
      cy.findAllByText("4 of 4").should("exist");
      cy.findAllByRole("button", { name: "Next slide" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
    });

    if (!(reactVersion.startsWith("16") && reactVersion.startsWith("17"))) {
      it("SHOULD update labels when scrolling", () => {
        cy.mount(<Default />);
        cy.findAllByText("1 of 4").should("exist");
        cy.get(".saltCarouselSlider").scrollTo("right");
        cy.wait(100);
        cy.findAllByText("4 of 4").should("exist");
        cy.findAllByText("3 of 4").should("not.exist");
        cy.findAllByText("2 of 4").should("not.exist");
        cy.findAllByText("1 of 4").should("not.exist");
      });
    } else {
      it.skip("SHOULD update labels when scrolling", () => {
        // flaky with react 16/17
      });
    }
  });

  describe("WHEN navigating with keyboard keys", () => {
    it("SHOULD support keyboard navigation", () => {
      cy.mount(<Default />);
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByText("2 of 4").should("not.exist");
      cy.findAllByRole("group").get('[tabindex="0"]').focus();
      cy.findAllByRole("group").get('[tabindex="0"]').realPress("ArrowRight");
      cy.findAllByText("2 of 4").should("exist");
      cy.findAllByText("1 of 4").should("not.exist");
      cy.wait(100);
      cy.findAllByRole("group").get('[tabindex="0"]').realPress("ArrowLeft");
      cy.findAllByText("1 of 4").should("exist");
      cy.findAllByText("2 of 4").should("not.exist");
    });
  });
});

