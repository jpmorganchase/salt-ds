import { DropdownButton } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a DropdownButton component", () => {
  it("renders the correct icon and label", async () => {
    await renderWithSalt(<DropdownButton label="button" />);

    await expect
      .element(page.getByRole("option"))
      .toHaveClass("saltDropdownButton-buttonLabel");
    await expect
      .element(page.getByTestId("ChevronDownIcon"))
      .toBeInTheDocument();
  });

  it("calls onKeyDown and onKeyUp for keyboard input", async () => {
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    await renderWithSalt(
      <DropdownButton
        id="test-button"
        label="button"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />,
    );

    document.querySelector<HTMLElement>("#test-button")?.focus();
    await userEvent.keyboard("B");
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onKeyUp).toHaveBeenCalledOnce();
  });
});
