import { composeStories } from "@storybook/react";
import * as segmentedButtonStories from "@stories/segmented-button-group/segmented-button-group.stories";

const composedStories = composeStories(segmentedButtonStories);

const { Default } = composedStories;

describe("GIVEN a SegmentedButton", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should display a SegmentedButton", () => {
      cy.mount(<Default />);

      cy.get(".saltSegmentedButtonGroup").should("be.visible");
    });
  });
});
