import { composeStories } from "@storybook/react";
import * as overlayStories from "@stories/overlay/overlay.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(overlayStories);
const { Default, Right, Bottom, Left } = composedStories;

describe("GIVEN an Overlay", () => {
  checkAccessibility(composedStories);

  describe("WHEN rendered", () => {
    it("THEN it should show Overlay on trigger element press", () => {
      cy.mount(<Default />);

      cy.realPress("Tab");
      cy.realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
      // focus goes into floating element
      cy.findByRole("button", { name: /Close Overlay/i }).should("be.focused");
    });

    it("THEN it should dismiss on Esc key press", () => {
      cy.mount(<Default />);

      cy.realPress("Tab");
      cy.realPress("Enter");
      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Escape");
      cy.findByRole("dialog").should("not.exist");
      // focus goes back to trigger element on floating element close
      cy.findByRole("button", { name: /Show Overlay/i }).should("be.focused");
    });

    it("THEN it should remain open until outside Overlay click or close button click", () => {
      const closeSpy = cy.stub().as("closeSpy");
      cy.mount(<Default onClose={closeSpy} />);

      cy.findByRole("button", { name: /Show Overlay/i }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("button", { name: /Close Overlay/i }).realClick();
      cy.get("@closeSpy").should("have.callCount", 1);
      cy.findByRole("dialog").should("not.exist");

      cy.findByRole("button", { name: /Show Overlay/i }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get("body").click(0, 0); // click outside of Overlay
      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should trap focus within Overlay once opened", () => {
      cy.mount(<Default open />);

      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("button", { name: /Close Overlay/i }).should("be.focused");
      cy.realPress("Tab");
      cy.findByText(/im a tooltip/i).should("be.visible");
      cy.realPress("Tab");
      cy.findByRole("button", { name: /Close Overlay/i }).should("be.focused");
    });
  });

  describe("WHEN mounted top", () => {
    it("THEN it should appear on top of trigger element", () => {
      cy.mount(<Default open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().y;
        cy.findByText(/Show Overlay/i).should(($el) => {
          expect($el[0].getBoundingClientRect().y).greaterThan(position);
        });
      });
    });
  });

  describe("WHEN mounted right", () => {
    it("THEN it should appear on right of trigger element", () => {
      cy.mount(<Right open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().x;
        cy.findByText(/Show Overlay/i).should(($el) => {
          expect($el[0].getBoundingClientRect().x).lessThan(position);
        });
      });
    });
  });

  describe("WHEN mounted bottom", () => {
    it("THEN it should appear on bottom of trigger element", () => {
      cy.mount(<Bottom open />);

      cy.findByRole("dialog").then(($el) => {
        const position = $el[0].getBoundingClientRect().y;
        cy.findByText(/Show Overlay/i).should(($el) => {
          expect($el[0].getBoundingClientRect().y).lessThan(position);
        });
      });
    });
  });

  describe("WHEN mounted left", () => {
    it("THEN it should appear on left of trigger element", () => {
      cy.mount(<Left open />);

      cy.findByRole("dialog").then(($el) => {
        const textPosition = $el[0].getBoundingClientRect().x;
        cy.findByText(/Show Overlay/i).should(($el) => {
          expect($el[0].getBoundingClientRect().x).greaterThan(textPosition);
        });
      });
    });
  });
});
