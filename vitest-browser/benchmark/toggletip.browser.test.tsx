import { Toggletip, ToggletipPanel, ToggletipTrigger } from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as toggletipStories from "~stories/toggletip/toggletip.stories";
import {
  CustomFloatingComponentProvider,
  FLOATING_TEST_ID,
} from "../../packages/core/src/__tests__/__e2e__/common";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(toggletipStories);
const { Default, InteractiveContent } = composedStories;

const defaultTrigger = () =>
  page.getByRole("button", { name: "More info about locked content" });

describe("GIVEN a Toggletip", () => {
  checkAccessibility(composedStories);

  it("flows focus through a text-only toggletip and back to the page", async () => {
    await renderWithSalt(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(defaultTrigger()).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveTextContent("More info");
    await expect.element(dialog).toHaveFocus();
    await userEvent.tab();
    await expect.element(dialog).not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
  });

  it("returns focus to the trigger when closed with Escape", async () => {
    await renderWithSalt(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("dialog")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(defaultTrigger()).toHaveFocus();
  });

  it("flows focus through interactive panel content", async () => {
    await renderWithSalt(
      <div>
        <button type="button">Before</button>
        <InteractiveContent />
        <button type="button">After</button>
      </div>,
    );
    const trigger = page.getByRole("button", { name: "Help info" });
    const dialog = page.getByRole("dialog");
    const link = page.getByRole("link", { name: "Link" });
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(dialog).toHaveFocus();
    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(dialog).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(trigger).toHaveFocus();
    await expect.element(dialog).toBeVisible();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(dialog).not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
  });

  it("opens for a pointer and dismisses on outside click", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(
      <div>
        <Toggletip onOpenChange={onOpenChange}>
          <ToggletipTrigger aria-label="Locked content help">
            <HelpCircleIcon aria-hidden />
          </ToggletipTrigger>
          <ToggletipPanel>Managed elsewhere</ToggletipPanel>
        </Toggletip>
        <button type="button">Outside</button>
      </div>,
    );
    await page.getByRole("button", { name: "Locked content help" }).click();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const dialog = page.getByRole("dialog", { name: "Locked content help" });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveTextContent("Managed elsewhere");
    await expect.element(dialog).toHaveFocus();
    await page.getByRole("button", { name: "Outside" }).click();
    await expect.element(dialog).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("renders through a configured floating component", async () => {
    await renderWithSalt(
      <CustomFloatingComponentProvider>
        <Default />
      </CustomFloatingComponentProvider>,
    );
    await defaultTrigger().click();
    await expect
      .element(page.getByTestId(FLOATING_TEST_ID))
      .toBeInTheDocument();
  });

  it("sets popup relationship attributes on the trigger", async () => {
    await renderWithSalt(<Default />);
    const trigger = defaultTrigger();
    await expect.element(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    const controlsId = trigger.element().getAttribute("aria-controls");
    if (!controlsId)
      throw new Error("Toggletip trigger is missing aria-controls");
    await expect
      .element(page.getByRole("dialog"))
      .toHaveAttribute("id", controlsId);
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the trigger is clicked again", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(
      <Toggletip onOpenChange={onOpenChange}>
        <ToggletipTrigger aria-label="Toggle info">
          <HelpCircleIcon aria-hidden />
        </ToggletipTrigger>
        <ToggletipPanel>Some content</ToggletipPanel>
      </Toggletip>,
    );
    const trigger = page.getByRole("button", { name: "Toggle info" });
    await trigger.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await trigger.click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("does not dismiss from clicks inside the panel", async () => {
    await renderWithSalt(
      <div>
        <InteractiveContent />
        <button type="button">Outside</button>
      </div>,
    );
    await page.getByRole("button", { name: "Help info" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.click();
    await expect.element(dialog).toBeVisible();
    await page.getByRole("link", { name: "Link" }).click();
    await expect.element(dialog).toBeVisible();
  });

  it("closes when Shift+Tab moves focus before the trigger", async () => {
    await renderWithSalt(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(defaultTrigger()).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(defaultTrigger()).toHaveFocus();
    await expect.element(dialog).toBeVisible();
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("button", { name: "Before" }))
      .toHaveFocus();
    await expect.element(dialog).not.toBeInTheDocument();
  });

  it("closes from an interactive child with Escape", async () => {
    await renderWithSalt(<InteractiveContent />);
    const trigger = page.getByRole("button", { name: "Help info" });
    await trigger.click();
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Link" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it("closes with Escape while focus is back on the trigger", async () => {
    await renderWithSalt(<InteractiveContent />);
    const trigger = page.getByRole("button", { name: "Help info" });
    await trigger.click();
    await userEvent.tab({ shift: true });
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it("respects a controlled open prop", async () => {
    await renderWithSalt(
      <Toggletip open>
        <ToggletipTrigger aria-label="Controlled test">
          <HelpCircleIcon aria-hidden />
        </ToggletipTrigger>
        <ToggletipPanel>Controlled content</ToggletipPanel>
      </Toggletip>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .element(page.getByRole("dialog"))
      .toHaveTextContent("Controlled content");
    await expect
      .element(page.getByRole("button", { name: "Controlled test" }))
      .toHaveAttribute("aria-expanded", "true");
  });
});
