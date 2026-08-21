import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as deckStories from "~stories/deck-layout/deck-layout.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(deckStories);
const { Default } = composedStories;

function deckItems() {
  return Array.from(document.querySelectorAll(".saltDeckItem"));
}

describe("Given a deck layout", () => {
  checkAccessibility(composedStories);

  it("renders with default values", async () => {
    await renderWithSalt(<Default />);
    const items = deckItems();
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveClass("saltDeckItem-static-current");
    expect(items[1]).toHaveClass("saltDeckItem-static-next");
  });

  it("renders the provided active index", async () => {
    await renderWithSalt(<Default activeIndex={1} />);
    expect(deckItems()[1]).toHaveClass("saltDeckItem-static-current");
  });

  it("navigates through slide items", async () => {
    await renderWithSalt(<Default activeIndex={1} animation="slide" />);
    let items = deckItems();
    expect(items[0]).toHaveClass("saltDeckItem-slide-previous");
    expect(items[1]).toHaveClass("saltDeckItem-slide-current");
    expect(items[2]).toHaveClass("saltDeckItem-slide-next");

    await page.getByRole("button", { name: "Previous" }).click();
    await expect
      .poll(() => deckItems()[0].className)
      .toContain("saltDeckItem-slide-current");
    expect(deckItems()[1]).toHaveClass("saltDeckItem-slide-next");

    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    items = deckItems();
    await expect
      .poll(() => items[2].className)
      .toContain("saltDeckItem-slide-current");
    expect(items[1]).toHaveClass("saltDeckItem-slide-previous");
    expect(items[3]).toHaveClass("saltDeckItem-slide-next");
  });

  it("uses vertical animation classes", async () => {
    await renderWithSalt(<Default direction="vertical" animation="slide" />);
    expect(document.querySelector(".saltDeckLayout-animate")).toHaveClass(
      "saltDeckLayout-slide-vertical",
    );
  });

  it("uses horizontal animation classes", async () => {
    await renderWithSalt(<Default animation="slide" />);
    expect(document.querySelector(".saltDeckLayout-animate")).toHaveClass(
      "saltDeckLayout-slide-horizontal",
    );
  });
});
