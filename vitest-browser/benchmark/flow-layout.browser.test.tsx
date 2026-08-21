import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import * as flowStories from "~stories/flow-layout/flow-layout.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(flowStories);
const { Default } = composedStories;

function flowLayout() {
  const element = document.querySelector(".saltFlexLayout");
  if (!element) throw new Error("Missing flow layout");
  return element;
}

describe("GIVEN a Flow", () => {
  checkAccessibility(composedStories);

  it("wraps by default", async () => {
    await renderWithSalt(<Default />);
    expect(getComputedStyle(flowLayout()).flexWrap).toBe("wrap");
  });

  it("renders with the default gap", async () => {
    await renderWithSalt(<Default />);
    const style = getComputedStyle(flowLayout());

    expect(style.columnGap).toBe("24px");
    expect(style.rowGap).toBe("24px");
  });
});
