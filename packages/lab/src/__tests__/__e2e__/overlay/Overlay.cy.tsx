import { composeStories } from "@storybook/react";
import * as overlayStories from "@stories/overlay/overlay.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(overlayStories);
const { Default, OverlayRight, OverlayBottom, OverlayLeft } = composedStories;

describe("GIVEN an Overlay", () => {
  checkAccessibility(composedStories);

  describe("WHEN rendered", () => {
    it("THEN it should show Overlay on anchor element press", () => {
      cy.mount(<Default />);

      cy.realPress("Tab").realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
      // focus remains on anchor element
      cy.findByText(/Toggle Overlay/i).should("be.focused");
    });

    it("THEN it should remain open on repeated anchor element press", () => {
      cy.mount(<Default />);

      cy.realPress("Tab").realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
    });

    it("THEN it should dismiss on Esc key press", () => {
      cy.mount(<Default />);

      cy.realPress("Tab").realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Escape");
      cy.findByRole("dialog").should("not.exist");
      // focus goes back to anchor element
      cy.findByRole("button", { name: /Toggle Overlay/i }).should("be.focused");
    });

    it("THEN it should remain open until outside Overlay click or close button click", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Toggle Overlay/i }).click();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltOverlay-closeButton").click();
      cy.findByRole("dialog").should("not.exist");

      cy.findByRole("button", { name: /Toggle Overlay/i }).click();
      cy.findByRole("dialog").should("be.visible");
      cy.get("body").click(0, 0); // click outside of Overlay
      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should trap focus within Overlay once opened", () => {
      cy.mount(<Default open />);

      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Tab");
      cy.get(".saltOverlay-closeButton").should("be.focused");
      cy.realPress("Tab");
      cy.findByText(/im a tooltip/i).should("be.visible");
      cy.realPress("Tab");
      cy.findAllByRole("button")
        .eq(1)
        .should("be.focused")
        .should("have.attr", "aria-label", "Close Overlay");
    });
  });

  describe("WHEN mounted top", () => {
    it("THEN it should appear on top of anchor element", () => {
      cy.mount(<Default open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().y;
        cy.findByText(/Toggle Overlay/i).should(($el) => {
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
        cy.findByText(/Toggle Overlay/i).should(($el) => {
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
        cy.findByText(/Toggle Overlay/i).should(($el) => {
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
        cy.findByText(/Toggle Overlay/i).should(($el) => {
          expect($el[0].getBoundingClientRect().x).greaterThan(textPosition);
        });
      });
    });
  });
});
