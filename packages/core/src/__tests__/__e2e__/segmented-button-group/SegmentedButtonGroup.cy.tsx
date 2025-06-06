import * as segmentedButtonStories from "@stories/segmented-button-group/segmented-button-group.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(segmentedButtonStories);

const { Default } = composedStories;

describe("GIVEN a SegmentedButton", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should display a SegmentedButton", () => {
      cy.mount(<Default />);

      cy.get(".saltSegmentedButtonGroup").should(
        "have.class",
        "saltSegmentedButtonGroup",
      );
    });
  });
});
