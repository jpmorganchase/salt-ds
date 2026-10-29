import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as splitStories from "~stories/split-layout/split-layout.stories";

const composedStories = composeStories(splitStories);
const { Default } = composedStories;

function splitLayout() {
  const element = document.querySelector(".saltFlexLayout");
  if (!element) throw new Error("Missing split layout");
  return element;
}

afterEach(() => page.viewport(1280, 1024));

describe("GIVEN a Split", () => {
  checkAccessibility(composedStories);

  it("does not wrap before the default small breakpoint", async () => {
    await renderWithSalt(<Default />);
    const style = getComputedStyle(splitLayout());
    expect(style.flexWrap).toBe("nowrap");
    expect(style.flexDirection).toBe("row");
  });

  it("wraps at the default small breakpoint", async () => {
    await page.viewport(599, 1024);
    await renderWithSalt(<Default />);
    await expect
      .poll(() => getComputedStyle(splitLayout()).flexDirection)
      .toBe("column");
  });

  it("renders with the default gap", async () => {
    await renderWithSalt(<Default />);
    const style = getComputedStyle(splitLayout());
    expect(style.columnGap).toBe("24px");
    expect(style.rowGap).toBe("24px");
  });

  it("renders start and end items", async () => {
    await renderWithSalt(
      <Default
        startItem={
          <div>
            Item 1<div>Item 2</div>
          </div>
        }
        endItem={
          <div>
            Item 3<div>Item 4</div>
          </div>
        }
      />,
    );
    const children = splitLayout().children;
    expect(children[0]).toHaveTextContent("Item 1Item 2");
    expect(children[children.length - 1]).toHaveTextContent("Item 3Item 4");
  });

  it("supports a custom gap", async () => {
    await renderWithSalt(<Default gap={2} />);
    const style = getComputedStyle(splitLayout());
    expect(style.columnGap).toBe("16px");
    expect(style.rowGap).toBe("16px");
  });
});
