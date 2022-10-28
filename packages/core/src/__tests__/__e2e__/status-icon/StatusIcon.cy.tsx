import { composeStories } from "@storybook/testing-react";
import * as statusIconStories from "@stories/status-icon.stories";

const { DefaultStatusIcon } = composeStories(statusIconStories);

describe("Given a Status Icon", () => {
  describe("WHEN a status value is provided", () => {
    it("should render an error icon", () => {
      cy.mount(<DefaultStatusIcon status="error" />);
      cy.get(".uitkStatusIcon").should("have.class", "uitkStatusIcon-error");
      cy.get(".uitkStatusIcon").should("have.attr", "aria-label", "error");
    });

    it("should render a success icon", () => {
      cy.mount(<DefaultStatusIcon status="success" />);
      cy.get(".uitkStatusIcon").should("have.class", "uitkStatusIcon-success");
      cy.get(".uitkStatusIcon").should("have.attr", "aria-label", "success");
    });

    it("should render a warning icon", () => {
      cy.mount(<DefaultStatusIcon status="warning" />);
      cy.get(".uitkStatusIcon").should("have.class", "uitkStatusIcon-warning");
      cy.get(".uitkStatusIcon").should("have.attr", "aria-label", "warning");
    });

    it("should render an info icon", () => {
      cy.mount(<DefaultStatusIcon status="info" />);
      cy.get(".uitkStatusIcon").should("have.class", "uitkStatusIcon-info");
      cy.get(".uitkStatusIcon").should("have.attr", "aria-label", "info");
    });
  });
});
