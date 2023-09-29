import { composeStories } from "@storybook/react";
import * as overlayStories from "@stories/overlay/overlay.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(overlayStories);
const { OverlayTop, OverlayRight, OverlayBottom, OverlayLeft } =
  composedStories;

describe("GIVEN an Overlay", () => {
  checkAccessibility(composedStories);

  describe("WHEN mounted top", () => {
    it("THEN it should appear on top of anchor element", () => {
      cy.mount(<OverlayTop open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().y;
        cy.findByRole("button", { name: "Toggle Overlay" }).should(($el) => {
          expect($el[0].getBoundingClientRect().y).greaterThan(position);
        });
      });
    });
  });
  describe("WHEN mounted right", () => {
    it("THEN it should appear on right of anchor element", () => {
      cy.mount(<OverlayRight open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().x;
        cy.findByRole("button", { name: "Toggle Overlay" }).should(($el) => {
          expect($el[0].getBoundingClientRect().x).lessThan(position);
        });
      });
    });
  });
  describe("WHEN mounted bottom", () => {
    it("THEN it should appear on bottom of anchor element", () => {
      cy.mount(<OverlayBottom open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().y;
        cy.findByRole("button", { name: "Toggle Overlay" }).should(($el) => {
          expect($el[0].getBoundingClientRect().y).lessThan(position);
        });
      });
    });
  });
  describe("WHEN mounted left", () => {
    it("THEN it should appear on left of anchor element", () => {
      cy.mount(<OverlayLeft open />);

      cy.findByRole("dialog").then(($el) => {
        const textPosition = $el[0].getBoundingClientRect().x;
        cy.findByRole("button", { name: "Toggle Overlay" }).should(($el) => {
          expect($el[0].getBoundingClientRect().x).greaterThan(textPosition);
        });
      });
    });
  });
});
