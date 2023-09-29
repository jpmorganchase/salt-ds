import { composeStories } from "@storybook/react";
import * as layerStories from "@stories/layer-layout/layer-layout.stories";

const composedStories = composeStories(layerStories);

const { Default, Top, Right, Left, Bottom } = composedStories;

describe("GIVEN a Layer", () => {
  describe("WHEN scrim is enabled", () => {
    it("THEN it should display a scrim by default", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltScrim").should("be.visible");
    });
  });

  describe("WHEN scrim is disabled", () => {
    it("THEN it should not display a scrim", () => {
      cy.mount(<Default disableScrim={true} />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltScrim").should("not.exist");
    });
  });

  describe("WHEN a position is not provided", () => {
    it("THEN it should default to a center position", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltLayerLayout").should("have.class", "saltLayerLayout-center");
    });
  });

  describe("WHEN a position is provided", () => {
    it("THEN it should render at the top", () => {
      cy.mount(<Top />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltLayerLayout").should("have.css", "top", "0px");
    });

    it("THEN it should render on the right hand side", () => {
      cy.mount(<Right />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltLayerLayout").should("have.css", "right", "0px");
    });

    it("THEN it should render on the left hand side", () => {
      cy.mount(<Left />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltLayerLayout").should("have.css", "left", "0px");
    });

    it("THEN it should render at the bottom", () => {
      cy.mount(<Bottom />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltLayerLayout").should("have.css", "bottom", "0px");
    });
  });

  describe("WHEN no fullScreenAtBreakpoint value is provided", () => {
    it(
      "THEN it should take up the whole screen on small viewports",
      {
        viewportHeight: 900,
        viewportWidth: 700,
      },
      () => {
        cy.mount(<Default />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".saltLayerLayout").should(
          "have.class",
          "saltLayerLayout-fullScreen"
        );
      }
    );
  });

  describe("WHEN a fullScreenAtBreakpoint value is provided", () => {
    it(
      "THEN it should take up the whole screen on medium viewports",
      {
        viewportHeight: 900,
        viewportWidth: 961,
      },
      () => {
        cy.mount(<Default fullScreenAtBreakpoint="md" />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".saltLayerLayout").should(
          "have.class",
          "saltLayerLayout-fullScreen"
        );
      }
    );

    it(
      "THEN it should take up the whole screen on extra large viewports",
      {
        viewportHeight: 900,
        viewportWidth: 1821,
      },
      () => {
        cy.mount(<Default fullScreenAtBreakpoint="xl" />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".saltLayerLayout").should(
          "have.class",
          "saltLayerLayout-fullScreen"
        );
      }
    );
  });

  describe("WHEN a layer component is closed", () => {
    it("THEN it should display an exit animation", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".saltLayerLayout").should("be.visible");

      cy.findByRole("button", { name: /Close Layer/i }).click();

      cy.get(".saltLayerLayout").should(
        "have.class",
        "saltLayerLayout-exit-animation"
      );

      cy.get(".saltLayerLayout").should("not.exist");
    });
  });

  describe("WHEN a layer component is in full screen mode", () => {
    it(
      "THEN it should be able to close",
      {
        viewportHeight: 900,
        viewportWidth: 700,
      },
      () => {
        cy.mount(<Default />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".saltLayerLayout").should("be.visible");

        cy.get(".saltLayerLayout").should(
          "have.class",
          "saltLayerLayout-fullScreen"
        );

        cy.findByRole("button", { name: /Close Layer/i }).click();

        cy.get(".saltLayerLayout").should("not.exist");
      }
    );
  });
});
