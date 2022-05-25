import { composeStories } from "@storybook/testing-react";
import * as layerStories from "@stories/layout/layer-layout.stories";

const composedStories = composeStories(layerStories);

const {
  DefaultLayerLayout,
  ToolkitLayerLayoutTop,
  ToolkitLayerLayoutRight,
  ToolkitLayerLayoutLeft,
  ToolkitLayerLayoutBottom,
} = composedStories;

describe("GIVEN a Layer", () => {
  describe("WHEN displayScrim is not disabled", () => {
    it("THEN it should display a scrim by default", () => {
      cy.mount(<DefaultLayerLayout />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkScrim").should("be.visible");
    });
  });

  describe("WHEN displayScrim is disabled", () => {
    it("THEN it should not display a scrim", () => {
      cy.mount(<DefaultLayerLayout displayScrim={false} />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkScrim").should("not.exist");
    });
  });

  describe("WHEN a position is not provided", () => {
    it("THEN it should default to a center position", () => {
      cy.mount(<DefaultLayerLayout />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkLayerLayout").should("have.class", "uitkLayerLayout-center");
    });
  });

  describe("WHEN a position is provided", () => {
    it("THEN it should render at the top", () => {
      cy.mount(<ToolkitLayerLayoutTop />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkLayerLayout").should("have.class", "uitkLayerLayout-top");
    });

    it("THEN it should render on the right hand side", () => {
      cy.mount(<ToolkitLayerLayoutRight />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkLayerLayout").should("have.class", "uitkLayerLayout-right");
    });

    it("THEN it should render on the left hand side", () => {
      cy.mount(<ToolkitLayerLayoutLeft />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkLayerLayout").should("have.class", "uitkLayerLayout-left");
    });

    it("THEN it should render at the bottom", () => {
      cy.mount(<ToolkitLayerLayoutBottom />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkLayerLayout").should("have.class", "uitkLayerLayout-bottom");
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
        cy.mount(<DefaultLayerLayout />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".uitkLayerLayout").should(
          "have.class",
          "uitkLayerLayout-fullScreen"
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
        cy.mount(<DefaultLayerLayout fullScreenAtBreakpoint="md" />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".uitkLayerLayout").should(
          "have.class",
          "uitkLayerLayout-fullScreen"
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
        cy.mount(<DefaultLayerLayout fullScreenAtBreakpoint="xl" />);

        cy.findByRole("button", { name: /Open Layer/i }).click();

        cy.get(".uitkLayerLayout").should(
          "have.class",
          "uitkLayerLayout-fullScreen"
        );
      }
    );
  });

  describe("WHEN a layer component is closed", () => {
    it("THEN it should display an exit animation", () => {
      cy.mount(<DefaultLayerLayout />);

      cy.findByRole("button", { name: /Open Layer/i }).click();

      cy.get(".uitkLayerLayout").should("be.visible");

      cy.findByRole("button", { name: /Close Layer/i }).click();

      cy.get(".uitkLayerLayout").should(
        "have.class",
        "uitkLayerLayout-exit-animation"
      );

      cy.get(".uitkLayerLayout").should("not.exist");
    });
  });
});
