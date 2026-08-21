import { AriaAnnouncerProvider, useAriaAnnouncer } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as buttonStories from "~stories/button/button.stories";
import * as rangeSliderStories from "~stories/range-slider/range-slider.stories";
import { renderWithSalt } from "./render";

const { Default: DefaultButton, FocusableWhenDisabled } =
  composeStories(buttonStories);
const { Default: DefaultRangeSlider } = composeStories(rangeSliderStories);

function AnnounceButton() {
  const { announce } = useAriaAnnouncer();

  return (
    <button type="button" onClick={() => announce("Pilot announcement")}>
      Announce
    </button>
  );
}

describe("Vitest Browser Mode pilot", () => {
  it("renders a composed Storybook story and passes an Axe scan", async () => {
    const { container } = await renderWithSalt(<DefaultButton />);
    const button = page.getByRole("button", { name: "Activate" });

    await expect.element(button).toBeVisible();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("uses real keyboard and pointer input with Vitest spies", async () => {
    const onClick = vi.fn();
    await renderWithSalt(<DefaultButton onClick={onClick} />);
    const button = page.getByRole("button", { name: "Activate" });

    await userEvent.tab();
    await expect.element(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await button.click();

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("preserves focusable-when-disabled interaction semantics", async () => {
    const onClick = vi.fn();
    await renderWithSalt(<FocusableWhenDisabled onClick={onClick} />);
    const button = page.getByRole("button");

    await expect.element(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect.element(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await button.click({ force: true });

    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports multi-element locators and slider keyboard behavior", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <DefaultRangeSlider
        defaultValue={[4, 8]}
        min={0}
        max={30}
        onChange={onChange}
      />,
    );
    const firstSlider = page.getByRole("slider").nth(0);

    await expect.element(firstSlider).toHaveValue("4");
    firstSlider.element().focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect.element(firstSlider).toHaveValue("5");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("retries assertions for ARIA live-region updates", async () => {
    await renderWithSalt(
      <AriaAnnouncerProvider data-testid="pilot-announcer">
        <AnnounceButton />
      </AriaAnnouncerProvider>,
    );

    await page.getByRole("button", { name: "Announce" }).click();

    await expect
      .element(page.getByTestId("pilot-announcer"))
      .toHaveTextContent("Pilot announcement");
  });
});
