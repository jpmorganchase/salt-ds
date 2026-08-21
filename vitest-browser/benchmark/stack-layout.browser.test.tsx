import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import * as stackStories from "~stories/stack-layout/stack-layout.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(stackStories);
const { Default } = composedStories;

function stackLayout() {
  const element = document.querySelector(".saltFlexLayout");
  if (!element) throw new Error("Missing stack layout");
  return element;
}

describe("GIVEN a Stack", () => {
  checkAccessibility(composedStories);

  it("does not wrap by default", async () => {
    await renderWithSalt(<Default />);
    expect(getComputedStyle(stackLayout()).flexWrap).toBe("nowrap");
  });

  it("renders with the default gap", async () => {
    await renderWithSalt(<Default />);
    const style = getComputedStyle(stackLayout());

    expect(style.columnGap).toBe("24px");
    expect(style.rowGap).toBe("24px");
  });

  it("renders as a column by default", async () => {
    await renderWithSalt(<Default />);
    expect(getComputedStyle(stackLayout()).flexDirection).toBe("column");
  });

  it("supports row direction", async () => {
    await renderWithSalt(<Default direction="row" />);
    expect(getComputedStyle(stackLayout()).flexDirection).toBe("row");
  });

  it("renders separators", async () => {
    await renderWithSalt(<Default separators />);
    expect(stackLayout()).toHaveClass("saltStackLayout-separator");
  });
});
