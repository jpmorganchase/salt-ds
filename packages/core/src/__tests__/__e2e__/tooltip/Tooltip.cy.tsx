import * as tooltipStories from "@stories/tooltip.stories";
import { composeStories } from "@storybook/testing-react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tooltipStories);

const { Default, OpenTooltip, ComponentAsContent } = composedStories;

describe("GIVEN a Tooltip", () => {
  checkAccessibility(composedStories);

  describe("WHEN rendered", () => {
    it('should have the aria role "tooltip"', () => {
      cy.mount(<OpenTooltip />);
      cy.findByRole("tooltip").should("exist");
    });

    it("should show tooltip when button is focused", () => {
      cy.mount(<Default />);

      cy.findByRole("button").realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");
    });

    it("should be dismissible with Escape", () => {
      cy.mount(<Default />);

      cy.findByRole("button").realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");

      cy.realPress("Escape");
      cy.findByRole("tooltip").should("not.exist");
    });

    it("should stay open if the popper element is hovered", () => {
      cy.mount(<Default />);

      cy.findByRole("button").realHover();

      cy.findByRole("tooltip").should("be.visible");

      cy.findByRole("tooltip").realHover();

      cy.findByRole("tooltip").should("be.visible");
    });

    it("should have z-index applied", () => {
      cy.mount(<Default />);

      cy.findByRole("button").focus();
      cy.findByRole("tooltip").should("be.visible");
      cy.findByRole("tooltip").should("have.css", "z-index", "1500");
    });
  });

  describe("WHEN tooltip placement is", () => {
    it("TOP - tooltip should be positioned above the trigger", () => {
      cy.mount(<OpenTooltip placement="top" />);

      cy.findByRole("button")
        .then(($el) => $el.position().top)
        .then((pos1) => {
          cy.findByRole("tooltip")
            .then(($el) => $el.position().top)
            .then((pos2) => {
              expect(pos1).to.be.gt(pos2);
            });
        });
    });

    it("BOTTOM - tooltip should be positioned bellow the trigger", () => {
      cy.mount(<OpenTooltip placement="bottom" />);

      cy.findByRole("button")
        .then(($el) => $el.position().top)
        .then((pos1) => {
          cy.findByRole("tooltip")
            .then(($el) => $el.position().top)
            .then((pos2) => {
              expect(pos1).to.be.lt(pos2);
            });
        });
    });

    it("LEFT - tooltip should be positioned to the left of the trigger", () => {
      cy.mount(<OpenTooltip placement="left" />);

      cy.findByRole("button")
        .then(($el) => $el.position().left)
        .then((pos1) => {
          cy.findByRole("tooltip")
            .then(($el) => $el.position().left)
            .then((pos2) => {
              expect(pos1).to.be.gt(pos2);
            });
        });
    });

    it("RIGHT - tooltip should be positioned to the right of the trigger", () => {
      cy.mount(<OpenTooltip placement="right" />);

      cy.findByRole("button")
        .then(($el) => $el.position().left)
        .then((pos1) => {
          cy.findByRole("tooltip")
            .then(($el) => $el.position().left)
            .then((pos2) => {
              expect(pos1).to.be.lt(pos2);
            });
        });
    });
  });

  describe("WHEN hideArrow", () => {
    it("shows arrow by default", () => {
      cy.mount(<OpenTooltip />);

      cy.get(".saltTooltip-arrow").should("be.visible");
    });

    it('arrow is not displayed when "hideArrow=true"', () => {
      cy.mount(<OpenTooltip hideArrow />);

      cy.get(".saltTooltip-arrow").should("not.exist");
    });
  });

  describe("WHEN hideIcon", () => {
    it("shows icon by default", () => {
      cy.mount(<OpenTooltip />);

      cy.get(".saltIcon").should("be.visible");
    });

    it('icon is not displayed when "hideIcon=true"', () => {
      cy.mount(<OpenTooltip hideIcon />);

      cy.get(".saltIcon").should("not.exist");
    });
  });

  describe("WHEN content = string", () => {
    it("then tooltip displays the string", () => {
      cy.mount(<OpenTooltip content="tooltip" />);

      cy.findByText("tooltip").should("be.visible");
    });
  });

  describe("WHEN content = component", () => {
    it("then tooltip displays the component", () => {
      cy.mount(<ComponentAsContent />);

      cy.get("h3").should("be.visible");
      cy.get("p").should("be.visible");
    });
  });
});
