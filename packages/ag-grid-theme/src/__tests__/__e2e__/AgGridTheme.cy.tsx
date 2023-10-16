import { composeStories } from "@storybook/react";
import * as agGridStories from "@stories/ag-grid-theme.stories";

const { BasicGrid } = composeStories(agGridStories);

describe("Given Ag Grid Theme", () => {
  describe("WHEN the Default dtory is mounted", () => {
    console.log("agGridStories", agGridStories);

    it("should match screenshot", () => {
      cy.mount(<BasicGrid />);
      cy.screenshot();
    });
  });
});
