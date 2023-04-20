import * as tooltipStories from "@stories/tooltip/tooltip.stories";
import { composeStories } from "@storybook/testing-react";
import { InfoIcon } from "@salt-ds/icons";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { Tooltip } from "@salt-ds/core";

const composedStories = composeStories(tooltipStories);

const { Default, Open, CustomContent } = composedStories;

describe("GIVEN a Tooltip", () => {
  checkAccessibility(composedStories);

  describe("WHEN rendered", () => {
    it('should have the aria role "tooltip"', () => {
      cy.mount(<Open />);
      cy.findByRole("tooltip").should("exist");
    });

    it("should show tooltip when button is focused", () => {
      cy.mount(<Default />);

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");
    });

    it("should be dismissible with Escape", () => {
      cy.mount(<Default />);

      cy.realPress("Tab");
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
      cy.mount(<Open placement="top" />);

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
      cy.mount(<Open placement="bottom" />);

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
      cy.mount(<Open placement="left" />);

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
      cy.mount(<Open placement="right" />);

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
      cy.mount(<Open />);

      cy.get(".saltTooltip-arrow").should("be.visible");
    });

    it('arrow is not displayed when "hideArrow=true"', () => {
      cy.mount(<Open hideArrow />);

      cy.get(".saltTooltip-arrow").should("not.exist");
    });
  });

  describe("WHEN hideIcon", () => {
    it("shows icon by default", () => {
      cy.mount(<Open />);

      cy.get(".saltIcon").should("be.visible");
    });

    it('icon is not displayed when "hideIcon=true"', () => {
      cy.mount(<Open hideIcon />);

      cy.get(".saltIcon").should("not.exist");
    });
  });

  describe("WHEN content = string", () => {
    it("then tooltip displays the string", () => {
      cy.mount(<Open content="tooltip" />);

      cy.findByText("tooltip").should("be.visible");
    });
  });

  describe("WHEN content = component", () => {
    it("then tooltip displays the component", () => {
      cy.mount(<CustomContent open />);

      cy.get("div").should("be.visible");
      cy.get("ul").should("be.visible");
      cy.get("li").should("be.visible");
    });
  });

  describe("WHEN used in header tag", () => {
    it("then tooltip displays default font weight and size", () => {
      cy.mount(
        <h3>
          Header{" "}
          <Tooltip open content="tooltip">
            <InfoIcon />
          </Tooltip>
        </h3>
      );
      cy.findByText("tooltip")
        .should("be.visible")
        .should("have.css", "font-size", "12px")
        .should("have.css", "font-weight", "400");
    });
  });
});
