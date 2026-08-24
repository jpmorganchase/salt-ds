import { ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as toggleButtonStories from "~stories/toggle-button/toggle-button.stories";

const { Controlled, DefaultSelected } = composeStories(toggleButtonStories);

function ToggleButtonExample({
  disabled,
  readOnly,
  selected,
  onChange,
}: {
  disabled?: boolean;
  readOnly?: boolean;
  selected?: boolean;
  onChange?: () => void;
}) {
  return (
    <ToggleButton
      disabled={disabled}
      readOnly={readOnly}
      selected={selected}
      value="home"
      onChange={onChange}
    >
      <HomeIcon aria-hidden />
      Home
    </ToggleButton>
  );
}

describe("GIVEN a ToggleButton", () => {
  it("toggles a controlled button", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Controlled onChange={onChange} />);
    const button = page.getByRole("button");

    await expect.element(button).toHaveTextContent("Home");
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    await button.click();
    await expect.element(button).toHaveAttribute("aria-pressed", "false");
    expect(onChange).toHaveBeenCalledOnce();
    await button.click();
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<ToggleButtonExample disabled onChange={onChange} />);
    const button = page.getByRole("button");

    await expect.element(button).toHaveAttribute("aria-pressed", "false");
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is not focusable when disabled", async () => {
    await renderWithSalt(<ToggleButtonExample disabled />);
    const button = page.getByRole("button");
    button.element().focus();
    await expect.element(button).not.toHaveFocus();
  });

  it("is not focusable when selected and disabled", async () => {
    await renderWithSalt(<ToggleButtonExample disabled selected />);
    const button = page.getByRole("button");
    await expect.element(button).toHaveAttribute("aria-disabled", "true");
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    button.element().focus();
    await expect.element(button).not.toHaveFocus();
  });

  it("does not toggle when read-only", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<ToggleButtonExample readOnly onChange={onChange} />);
    const button = page.getByRole("button");

    await expect.element(button).toHaveAttribute("aria-readonly");
    await button.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "is focusable when read-only (selected=%s)",
    async (selected) => {
      await renderWithSalt(
        <ToggleButtonExample readOnly selected={selected} />,
      );
      const button = page.getByRole("button");
      await userEvent.tab();
      await expect.element(button).toHaveFocus();
      await expect
        .element(button)
        .toHaveAttribute("aria-pressed", selected ? "true" : "false");
    },
  );

  it("is selected by default", async () => {
    await renderWithSalt(<DefaultSelected />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-pressed", "true");
  });

  it("can be controlled by selected", async () => {
    await renderWithSalt(<DefaultSelected selected={false} />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-pressed", "false");
  });
});
