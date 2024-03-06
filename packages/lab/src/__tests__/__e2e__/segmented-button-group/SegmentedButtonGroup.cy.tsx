import { composeStories } from "@storybook/react";
import * as dialogStories from "@stories/segmented-button-group/segmented-button-group.stories";

const composedStories = composeStories(dialogStories);

const { Default } = composedStories;

describe("GIVEN a SegmentedButton", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should display a SegmentedButton", () => {
      cy.mount(<Default />);

      cy.get(".saltSegmentedButtonGroup").should("be.visible");
    });
  });
});
