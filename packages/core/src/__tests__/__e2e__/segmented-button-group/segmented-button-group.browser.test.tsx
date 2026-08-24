import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { renderWithSalt } from "~browser-test-utils/render";
import * as segmentedButtonStories from "~stories/segmented-button-group/segmented-button-group.stories";

const composedStories = composeStories(segmentedButtonStories);
const { Default } = composedStories;

describe("GIVEN a SegmentedButton", () => {
  it("renders with its default class", async () => {
    await renderWithSalt(<Default />);
    expect(document.querySelector(".saltSegmentedButtonGroup")).toHaveClass(
      "saltSegmentedButtonGroup",
    );
  });
});
