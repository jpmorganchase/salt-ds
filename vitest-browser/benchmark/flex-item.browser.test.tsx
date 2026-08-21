import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import * as flexStories from "~stories/flex-item/flex-item.stories";
import { renderWithSalt } from "../render";

const composedStories = composeStories(flexStories);
const { FlexItemWrapper } = composedStories;

function firstFlexItem() {
  const element = document.querySelector(".saltFlexLayout > .saltFlexItem");
  if (!element) throw new Error("Missing flex item");
  return element;
}

describe("GIVEN a FlexItem in FlexLayout", () => {
  it("renders the default flex properties", async () => {
    await renderWithSalt(<FlexItemWrapper />);
    const style = getComputedStyle(firstFlexItem());

    expect(style.flexGrow).toBe("0");
    expect(style.flexShrink).toBe("1");
    expect(style.flexBasis).toBe("auto");
  });

  it("renders overridden flex properties", async () => {
    await renderWithSalt(<FlexItemWrapper grow={2} shrink={2} basis="100px" />);
    const style = getComputedStyle(firstFlexItem());

    expect(style.flexGrow).toBe("2");
    expect(style.flexShrink).toBe("2");
    expect(style.flexBasis).toBe("100px");
  });
});
