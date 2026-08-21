import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import * as megaMenuStories from "~stories/mega-menu/mega-menu.stories";
import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

const { Baseline, DefaultOpen, Controlled } = composeStories(megaMenuStories);

function panel() {
  const element = document.querySelector(".saltMegaMenuPanel");
  return element ? page.elementLocator(element) : null;
}

describe("Given the Baseline MegaMenu example", () => {
  it("renders triggers and keeps menus closed initially", async () => {
    await renderWithSalt(<Baseline />);
    await expect
      .element(page.getByRole("button", { name: "Solutions" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Services" }))
      .toBeInTheDocument();
    expect(panel()).toBeNull();
  });

  it("opens and closes a menu on trigger click", async () => {
    await renderWithSalt(<Baseline />);
    const trigger = page.getByRole("button", { name: "Solutions" });
    await trigger.click();
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .not.toBeNull();
    await trigger.click();
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .toBeNull();
  });

  it("switches between top-level triggers", async () => {
    await renderWithSalt(<Baseline />);
    await page.getByRole("button", { name: "Solutions" }).click();
    await expect
      .element(page.getByRole("link", { name: "Digital Banking" }))
      .toBeInTheDocument();
    await page.getByRole("button", { name: "Services" }).click();
    await expect
      .element(page.getByRole("link", { name: "Strategy" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("link", { name: "Digital Banking" }))
      .not.toBeInTheDocument();
  });

  it("selects an item and closes the menu", async () => {
    await renderWithSalt(<Baseline />);
    await page.getByRole("button", { name: "Solutions" }).click();
    await page.getByRole("link", { name: "Digital Banking" }).click();
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .toBeNull();
  });

  it("closes on outside click", async () => {
    await renderWithSalt(
      <>
        <button type="button">Outside menu</button>
        <Baseline />
      </>,
    );
    await page.getByRole("button", { name: "Solutions" }).click();
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .not.toBeNull();
    await page.getByRole("button", { name: "Outside menu" }).click();
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .toBeNull();
  });
});

describe("Given a controlled MegaMenu", () => {
  it("keeps the panel open when the parent owns open state", async () => {
    await renderWithSalt(<Controlled open />);
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .not.toBeNull();
    await page.getByRole("button", { name: "Solutions" }).click();
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .not.toBeNull();
  });
});

describe("Given a MegaMenu with onOpenChange", () => {
  it("reports opening and closing from the trigger", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<Controlled onOpenChange={onOpenChange} />);
    const trigger = page.getByRole("button", { name: "Solutions" });
    await trigger.click();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await trigger.click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("reports closing when an item is selected", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<Controlled onOpenChange={onOpenChange} />);
    await page.getByRole("button", { name: "Solutions" }).click();
    await page.getByRole("link", { name: "Digital Banking" }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Given the DefaultOpen MegaMenu example", () => {
  it("renders its panel open from the start", async () => {
    await renderWithSalt(<DefaultOpen />);
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .not.toBeNull();
    await expect
      .element(page.getByRole("link", { name: "Digital Banking" }))
      .toBeInTheDocument();
  });

  it("is accessible while open", async () => {
    const { container } = await renderWithSalt(<DefaultOpen />);
    await expect.element(page.getByRole("region")).toBeInTheDocument();
    await runAxeScan(container);
  });
});
