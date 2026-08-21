import { composeStories } from "@storybook/react-vite";
import { version } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as cascadingMenuStories from "~stories/cascading-menu/cascading-menu.stories";

import { renderWithSalt } from "../render";

const { Default } = composeStories(cascadingMenuStories);
const trigger = () => page.getByTestId("cascading-menu-trigger");
const menuCount = async () => (await page.getByRole("menu").elements()).length;

async function focusTrigger() {
  (await trigger().element()).focus();
}

async function pressKeys(...keys: string[]) {
  for (const key of keys) await userEvent.keyboard(key);
}

describe("GIVEN a CascadingMenu component", () => {
  it("THEN the content alone will render", async () => {
    await renderWithSalt(<Default />);
    await expect.element(trigger()).toHaveClass("saltButton");
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  });

  it("THEN the menu will be displayed when clicked", async () => {
    await renderWithSalt(<Default />);
    await trigger().click();
    await expect.poll(menuCount).toBe(1);
  });

  it("THEN the menu will not be displayed when only focused", async () => {
    await renderWithSalt(<Default />);
    await focusTrigger();
    await expect.poll(menuCount).toBe(0);
  });

  it("THEN the menu will be displayed when ArrowDown is pressed", async () => {
    await renderWithSalt(<Default />);
    await focusTrigger();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(menuCount).toBe(1);
  });

  it("THEN the submenu will be displayed when Enter is pressed", async () => {
    await renderWithSalt(<Default />);
    await focusTrigger();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(menuCount).toBe(2);
  });

  describe("Sub menus navigation", () => {
    const maybeIt = version.startsWith("18") ? it.skip : it;

    maybeIt("By Enter key", async () => {
      await renderWithSalt(<Default />);
      await focusTrigger();
      await pressKeys("{ArrowDown}", "{Enter}", "{ArrowDown}", "{Enter}");
      await expect.poll(menuCount).toBe(3);
    });

    maybeIt("By Right Arrow key", async () => {
      await renderWithSalt(<Default />);
      await focusTrigger();
      await pressKeys(
        "{ArrowDown}",
        "{ArrowRight}",
        "{ArrowDown}",
        "{ArrowRight}",
      );
      await expect.poll(menuCount).toBe(3);
    });

    maybeIt("Escape closes on 'topmost' menu", async () => {
      await renderWithSalt(<Default />);
      await focusTrigger();
      await pressKeys(
        "{ArrowDown}",
        "{ArrowRight}",
        "{ArrowDown}",
        "{ArrowRight}",
      );
      await expect.poll(menuCount).toBe(3);
      await userEvent.keyboard("{Escape}");
      await expect.poll(menuCount).toBe(2);
      await userEvent.keyboard("{Escape}");
      await expect.poll(menuCount).toBe(1);
      await userEvent.keyboard("{Escape}");
      await expect.poll(menuCount).toBe(0);
    });

    it("Click-away closes all menus", async () => {
      await renderWithSalt(<Default />);
      await focusTrigger();
      await pressKeys(
        "{ArrowDown}",
        "{ArrowRight}",
        "{ArrowDown}",
        "{ArrowRight}",
      );
      await userEvent.click(document.body);
      await expect.poll(menuCount).toBe(0);
    });
  });

  describe("Focus management", () => {
    it("Focus shifts from trigger to 'topmost' menu", async () => {
      await renderWithSalt(<Default />);
      await focusTrigger();
      expect(document.activeElement).toHaveClass("saltButton");
      await userEvent.keyboard("{ArrowDown}");
      await expect
        .poll(() =>
          document.activeElement?.classList.contains("saltCascadingMenuList"),
        )
        .toBe(true);
    });
  });
});
