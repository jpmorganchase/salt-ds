import { composeStories } from "@storybook/react-vite";
import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as switchStories from "~stories/switch/switch.stories";

import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(switchStories);
const { Default, Disabled, Controlled, WithFormField, Readonly } =
  composedStories;
const control = () => page.getByRole("switch");

function persistentChangeSpy() {
  const spy = vi.fn();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist();
    spy(event);
  };
  return { spy, handleChange };
}

function expectLastChecked(spy: ReturnType<typeof vi.fn>, checked: boolean) {
  expect(spy.mock.lastCall?.[0].target.checked).toBe(checked);
}

async function exerciseSelection(Story: typeof Default | typeof Controlled) {
  const { spy, handleChange } = persistentChangeSpy();
  await renderWithSalt(<Story onChange={handleChange} />);
  await expect.element(control()).not.toBeChecked();
  await control().click();
  await expect.element(control()).toBeChecked();
  expect(spy).toHaveBeenCalledTimes(1);
  expectLastChecked(spy, true);
  await control().click();
  await expect.element(control()).not.toBeChecked();
  expect(spy).toHaveBeenCalledTimes(2);
  expectLastChecked(spy, false);
}

async function exerciseKeyboard(Story: typeof Default | typeof Controlled) {
  const { spy, handleChange } = persistentChangeSpy();
  await renderWithSalt(<Story onChange={handleChange} />);
  await userEvent.tab();
  await expect.element(control()).not.toBeChecked();
  await expect.element(control()).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(control()).not.toBeChecked();
  expect(spy).not.toHaveBeenCalled();
  await userEvent.keyboard(" ");
  await expect.element(control()).toBeChecked();
  expect(spy).toHaveBeenCalledTimes(1);
  expectLastChecked(spy, true);
  await userEvent.keyboard(" ");
  await expect.element(control()).not.toBeChecked();
  expect(spy).toHaveBeenCalledTimes(2);
  expectLastChecked(spy, false);
}

describe("GIVEN a Switch", () => {
  checkAccessibility(composedStories);

  it("SHOULD support data attribute on inputProps", async () => {
    await renderWithSalt(
      <Default inputProps={{ "data-testid": "customInput" }} checked />,
    );
    await expect.element(page.getByTestId("customInput")).toBeChecked();
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", async () => {
      await renderWithSalt(<Default defaultChecked />);
      await expect.element(control()).toBeChecked();
    });

    it("SHOULD handle selection using a mouse", async () => {
      await exerciseSelection(Default);
    });

    it("SHOULD handle selection using a keyboard", async () => {
      await exerciseKeyboard(Default);
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should be checked if checked is true", async () => {
      await renderWithSalt(<Default checked />);
      await expect.element(control()).toBeChecked();
    });

    it("THEN should allow selection using a mouse", async () => {
      await exerciseSelection(Controlled);
    });

    it("THEN should allow selection using a keyboard", async () => {
      await exerciseKeyboard(Controlled);
    });
  });

  describe("WHEN disabled", () => {
    it("THEN should not be interactive", async () => {
      const changeSpy = vi.fn();
      await renderWithSalt(<Disabled onChange={changeSpy} />);
      const input = control();
      await expect.element(input).toBeDisabled();
      await expect.element(input).not.toBeChecked();
      ((await input.element()) as HTMLElement).click();
      await expect.element(input).not.toBeChecked();
      (
        (await page.getByLabelText("Disabled").element()) as HTMLElement
      ).click();
      await expect.element(input).not.toBeChecked();
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it("THEN should not be focusable", async () => {
      await renderWithSalt(
        <>
          <button type="button">Before</button>
          <Disabled />
          <button type="button">After</button>
        </>,
      );
      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Before" }))
        .toHaveFocus();
      await userEvent.tab();
      await expect.element(control()).not.toHaveFocus();
      await expect
        .element(page.getByRole("button", { name: "After" }))
        .toHaveFocus();
    });
  });

  it("THEN should NOT render label when used without one", async () => {
    await renderWithSalt(<Default label={undefined} />);
    await expect
      .element(page.getByLabelText("Default"))
      .not.toBeInTheDocument();
    await expect.element(control()).not.toHaveAttribute("aria-describedby");
    await expect.element(control()).not.toHaveAttribute("aria-labelledby");
  });

  it("THEN should not be selectable when readOnly", async () => {
    const changeSpy = vi.fn();
    await renderWithSalt(<Readonly onChange={changeSpy} />);
    const input = control();
    await expect.element(input).toHaveAttribute("aria-readonly", "true");
    await userEvent.tab();
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(input).not.toBeChecked();
    await input.click();
    await expect.element(input).not.toBeChecked();
    await page.getByLabelText("Read-only").click();
    await expect.element(input).not.toBeChecked();
    expect(changeSpy).not.toHaveBeenCalled();
  });

  describe("WHEN wrapped in a form field", () => {
    it("THEN should respect accessibility attributes and allow selection", async () => {
      const { spy, handleChange } = persistentChangeSpy();
      await renderWithSalt(<WithFormField onChange={handleChange} />);
      const input = control();
      await expect.element(input).toHaveAccessibleName("Label");
      await expect.element(input).toHaveAccessibleDescription("Helper text");
      await page.getByLabelText("Label").click();
      await expect.element(input).toHaveFocus();
      await expect.element(input).toBeChecked();
      expectLastChecked(spy, true);
      await input.click();
      await expect.element(input).not.toBeChecked();
      expectLastChecked(spy, false);
    });

    it("THEN should respect form field disabled state", async () => {
      const changeSpy = vi.fn();
      await renderWithSalt(<WithFormField disabled onChange={changeSpy} />);
      const input = control();
      await expect.element(input).toHaveAccessibleName("Label");
      await expect.element(input).toHaveAccessibleDescription("Helper text");
      await expect.element(input).toBeDisabled();
      ((await input.element()) as HTMLElement).click();
      ((await page.getByLabelText("Label").element()) as HTMLElement).click();
      await expect.element(input).not.toBeChecked();
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it("THEN should respect form field readOnly state", async () => {
      const changeSpy = vi.fn();
      await renderWithSalt(<WithFormField readOnly onChange={changeSpy} />);
      const input = control();
      await expect.element(input).toHaveAccessibleName("Label");
      await expect.element(input).toHaveAccessibleDescription("Helper text");
      await expect.element(input).toHaveAttribute("aria-readonly", "true");
      await input.click();
      await page.getByLabelText("Label").click();
      await expect.element(input).not.toBeChecked();
      expect(changeSpy).not.toHaveBeenCalled();
    });
  });
});
