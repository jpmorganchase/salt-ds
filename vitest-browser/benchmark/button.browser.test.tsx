import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as buttonStories from "~stories/button/button.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(buttonStories);
const { Default, FocusableWhenDisabled, LoadingSingle } = composedStories;

describe("Given a Button", () => {
  checkAccessibility(composedStories);

  it("renders text as children", async () => {
    await renderWithSalt(<Default />);
    await expect
      .element(page.getByText(Default.args?.children as string))
      .toBeVisible();
  });

  it("calls onClick when interacted with", async () => {
    const onClick = vi.fn();
    await renderWithSalt(<Default onClick={onClick} />);
    const button = page.getByRole("button");

    await userEvent.tab();
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await button.click();
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("calls onBlur when blurred", async () => {
    const onBlur = vi.fn();
    await renderWithSalt(<Default onBlur={onBlur} />);
    const button = page.getByRole("button");

    await userEvent.tab();
    await expect.element(button).toHaveFocus();
    await userEvent.tab();
    await expect.element(button).not.toHaveFocus();
    expect(onBlur).toHaveBeenCalled();
  });

  it.each([
    ["focusableWhenDisabled", FocusableWhenDisabled],
    ["loading", LoadingSingle],
  ] as const)(
    "is focusable but non-interactive when %s",
    async (_name, Story) => {
      const onClick = vi.fn();
      await renderWithSalt(<Story onClick={onClick} />);
      const button = page.getByRole("button");

      await userEvent.tab();
      await expect.element(button).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard(" ");
      await button.click({ force: true });
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it("applies the type prop", async () => {
    await renderWithSalt(<Default type="submit" />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("type", "submit");
  });

  it("defaults type to button", async () => {
    await renderWithSalt(<Default />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("type", "button");
  });

  it("falls back to the default class for an invalid variant", async () => {
    // @ts-expect-error testing runtime handling of an invalid variant
    await renderWithSalt(<Default variant="invalid" />);
    await expect.element(page.getByRole("button")).toHaveClass("saltButton");
  });

  it.each([
    ["loading", LoadingSingle],
    ["focusableWhenDisabled", FocusableWhenDisabled],
  ] as const)("does not submit a form when %s", async (_name, Story) => {
    const onSubmit = vi.fn();
    await renderWithSalt(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(event);
        }}
      >
        <Story />
      </form>,
    );
    const button = page.getByRole("button");

    await button.click({ force: true });
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
