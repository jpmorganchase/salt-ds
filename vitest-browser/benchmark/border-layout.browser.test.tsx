import { BORDER_POSITION as borderAreas } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import * as borderStories from "~stories/border-layout/border-layout.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(borderStories);
const { AllPanels, NoHeaderOrFooter } = composedStories;

function borderLayout() {
  const element = document.querySelector(".saltBorderLayout");
  if (!element) throw new Error("Missing border layout");
  return element;
}

describe("GIVEN a Border", () => {
  checkAccessibility(composedStories);

  it("renders items in the correct positions", async () => {
    await renderWithSalt(<AllPanels />);

    expect(getComputedStyle(borderLayout()).gridTemplateAreas).toBe(
      '"north north north" "west center east" "south south south"',
    );
    const items = document.querySelectorAll(
      ".saltBorderLayout > .saltBorderItem",
    );
    for (const [index, item] of Array.from(items).entries()) {
      const style = getComputedStyle(item);
      expect(style.gridColumnStart).toBe(borderAreas[index]);
      expect(style.gridColumnEnd).toBe(borderAreas[index]);
      expect(style.gridRowStart).toBe(borderAreas[index]);
      expect(style.gridRowEnd).toBe(borderAreas[index]);
    }
  });

  it("has no gap by default", async () => {
    await renderWithSalt(<AllPanels />);
    const style = getComputedStyle(borderLayout());

    expect(style.columnGap).toBe("0px");
    expect(style.rowGap).toBe("0px");
  });

  it("collapses to one row without north and south regions", async () => {
    await renderWithSalt(<NoHeaderOrFooter />);
    expect(getComputedStyle(borderLayout()).gridTemplateAreas).toBe(
      '"west center east"',
    );
  });
});
