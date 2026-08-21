import { Scrim } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import * as scrimStories from "~stories/scrim/scrim.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(scrimStories);
const { WithSpinner } = composedStories;

describe("Given a Scrim", () => {
  checkAccessibility({ WithSpinner });

  it("renders children when open", async () => {
    await renderWithSalt(<Scrim open>Click to close Scrim</Scrim>);
    await expect
      .element(page.getByText("Click to close Scrim"))
      .toBeInTheDocument();
  });

  it("calls its onClick handler", async () => {
    const onClick = vi.fn();
    await renderWithSalt(<Scrim onClick={onClick} open />);

    await page.getByTestId("scrim").click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
