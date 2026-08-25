import { Kbd } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as kbdStories from "~stories/kbd/kbd.stories";

const composedStories = composeStories(kbdStories);

describe("Given a Kbd", () => {
  checkAccessibility(composedStories);

  it("renders as a semantic kbd element", async () => {
    await renderWithSalt(
      <Kbd id="my-kbd" data-test="kbd-test">
        Key
      </Kbd>,
    );

    const kbd = document.querySelector("kbd");
    expect(kbd).toBeInTheDocument();
    expect(kbd).toHaveAttribute("id", "my-kbd");
    expect(kbd).toHaveAttribute("data-test", "kbd-test");
  });
});
