import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as megaMenuStories from "~stories/mega-menu/mega-menu.stories";
import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

const {
  Baseline,
  WithRegionsLayout,
  WithCustomHeadingId,
  WithoutGroupHeading,
  WithExtraGroupLabel,
  WithCurrentItem,
} = composeStories(megaMenuStories);

const trigger = (name = "Solutions") => page.getByRole("button", { name });
const link = (name: string) => page.getByRole("link", { name });

async function expectPanel(open: boolean) {
  if (open) {
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .not.toBeNull();
  } else {
    await expect
      .poll(() => document.querySelector(".saltMegaMenuPanel"))
      .toBeNull();
  }
}

async function openSolutions() {
  trigger().element().focus();
  await expect.element(trigger()).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expectPanel(true);
}

async function renderOpenSolutions() {
  const result = await renderWithSalt(<Baseline />);
  await openSolutions();
  return result;
}

async function key(key: string) {
  await userEvent.keyboard(key);
}

async function expectLinkFocus(name: string) {
  await expect.element(link(name)).toHaveFocus();
}

async function expectTriggerFocus(name = "Solutions") {
  await expect.element(trigger(name)).toHaveFocus();
}

describe("Given a MegaMenu", () => {
  describe("navigation landmark and trigger structure", () => {
    it("exposes the triggers within a navigation landmark and a list", async () => {
      await renderWithSalt(<Baseline />);

      const navigation = page.getByRole("navigation", { name: "Main" });
      await expect
        .element(navigation.getByRole("button", { name: "Solutions" }))
        .toBeInTheDocument();
      await expect
        .element(navigation.getByRole("list").getByRole("listitem"))
        .toHaveLength(2);
    });
  });

  describe("trigger aria attributes", () => {
    it("reflects the collapsed state with aria-expanded=false and no aria-controls", async () => {
      await renderWithSalt(<Baseline />);

      await expect.element(trigger()).toHaveAttribute("aria-expanded", "false");
      await expect.element(trigger()).not.toHaveAttribute("aria-controls");
    });

    it("sets aria-expanded=true and aria-controls referencing the panel when open", async () => {
      await renderWithSalt(<Baseline />);
      await trigger().click();

      await expect.element(trigger()).toHaveAttribute("aria-expanded", "true");
      const panelId = trigger().element().getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      const panel = document.getElementById(panelId as string);
      expect(panel).toHaveAttribute("role", "region");
      expect(panel).toHaveClass("saltMegaMenuPanel");
    });

    it("clears aria-expanded back to false after closing", async () => {
      await renderWithSalt(<Baseline />);
      await trigger().click();
      await expect.element(trigger()).toHaveAttribute("aria-expanded", "true");

      await trigger().click();
      await expect.element(trigger()).toHaveAttribute("aria-expanded", "false");
      await expect.element(trigger()).not.toHaveAttribute("aria-controls");
    });
  });

  describe("panel region semantics", () => {
    it("renders the panel as a region with the provided aria-label", async () => {
      await renderWithSalt(<Baseline />);
      await trigger().click();

      await expect
        .element(page.getByRole("region", { name: "Solutions menu" }))
        .toHaveClass("saltMegaMenuPanel");
    });

    it("gives each panel a distinct accessible name", async () => {
      await renderWithSalt(<Baseline />);
      await trigger("Services").click();

      await expect
        .element(page.getByRole("region", { name: "Services menu" }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("region", { name: "Solutions menu" }))
        .not.toBeInTheDocument();
    });
  });

  describe("group list semantics", () => {
    it("exposes each group as a list named after its header", async () => {
      await renderWithSalt(<Baseline />);
      await trigger().click();

      await expect
        .element(
          page
            .getByRole("list", { name: "Financial Services" })
            .getByRole("listitem"),
        )
        .toHaveLength(2);
      await expect
        .element(
          page.getByRole("list", { name: "Healthcare" }).getByRole("listitem"),
        )
        .toHaveLength(2);
    });

    it("honours a consumer-provided heading id and labels the list with it", async () => {
      await renderWithSalt(<WithCustomHeadingId />);

      expect(document.getElementById("custom-heading-id")).toHaveTextContent(
        "Financial Services",
      );
      await expect
        .element(page.getByRole("list", { name: "Financial Services" }))
        .toHaveAttribute("aria-labelledby", "custom-heading-id");
    });

    it("omits aria-labelledby when the group has no heading", async () => {
      await renderWithSalt(<WithoutGroupHeading />);

      await expect
        .element(page.getByRole("list"))
        .not.toHaveAttribute("aria-labelledby");
    });

    it("combines the group heading with a consumer-provided aria-labelledby", async () => {
      await renderWithSalt(<WithExtraGroupLabel />);

      await expect
        .element(
          page.getByRole("list", {
            name: "Financial Services Recommended",
          }),
        )
        .toBeInTheDocument();
    });
  });

  describe("current item semantics", () => {
    it("marks the item with the current prop as aria-current=page", async () => {
      await renderWithSalt(<WithCurrentItem />);

      await expect
        .element(link("Digital Banking"))
        .toHaveAttribute("aria-current", "page");
    });

    it("leaves other items without aria-current", async () => {
      await renderWithSalt(<WithCurrentItem />);

      await expect
        .element(link("Risk Management"))
        .not.toHaveAttribute("aria-current");
    });
  });

  describe("keyboard focus boundaries", () => {
    it("collapses the menu and moves focus out when Tab passes the last item", async () => {
      await renderOpenSolutions();

      await key("{Tab}{Tab}{Tab}{Tab}");
      await expectLinkFocus("Telemedicine");
      await key("{Tab}");
      await expectPanel(false);
      await expectTriggerFocus("Services");
    });

    it("returns focus to the trigger when Shift+Tab passes the first item, keeping the menu open", async () => {
      await renderOpenSolutions();

      await key("{Tab}");
      await expectLinkFocus("Digital Banking");
      await key("{Shift>}{Tab}{/Shift}");
      await expectTriggerFocus();
      await expectPanel(true);
    });

    it("closes and returns focus to the trigger on Escape", async () => {
      await renderOpenSolutions();

      await key("{Tab}");
      await expectLinkFocus("Digital Banking");
      await key("{Escape}");
      await expectPanel(false);
      await expectTriggerFocus();
    });

    it("degrades arrows to a linear walk when the grid is stacked at a small viewport", async () => {
      await renderOpenSolutions();
      document
        .querySelector(".saltMegaMenuPanel")
        ?.classList.add("mega-menu-small-viewport");

      await key("{Tab}");
      await expectLinkFocus("Digital Banking");
      await key("{ArrowDown}");
      await expectLinkFocus("Risk Management");
      await key("{ArrowDown}");
      await expectLinkFocus("Patient Management");
      await key("{ArrowUp}");
      await expectLinkFocus("Risk Management");
    });

    it("returns focus to the trigger on ArrowUp from the first item when stacked", async () => {
      await renderOpenSolutions();
      document
        .querySelector(".saltMegaMenuPanel")
        ?.classList.add("mega-menu-small-viewport");

      await key("{Tab}");
      await expectLinkFocus("Digital Banking");
      await key("{ArrowUp}");
      await expectTriggerFocus();
      await expectPanel(true);
    });
  });

  describe("panel layout (source-order positioning)", () => {
    it("places content regions around the body and the action bar inside it, from source order", async () => {
      await renderWithSalt(<WithRegionsLayout />);

      const panel = document.querySelector(".saltMegaMenuPanel");
      expect(panel).not.toBeNull();
      expect(
        Array.from(panel?.children ?? [], (child) => child.classList[0]),
      ).toEqual([
        "saltMegaMenuAside",
        "saltMegaMenuContent",
        "saltMegaMenuAside",
      ]);
      const content = panel?.children[1];
      expect(panel?.children[0]).toHaveTextContent("Left region link");
      expect(content).toHaveClass("saltMegaMenuContent");
      expect(panel?.children[2]).toHaveTextContent("Right region link");
      expect(content?.querySelector(".saltMegaMenuActions")).toHaveTextContent(
        "Bottom band link",
      );
    });
  });

  describe("axe checks", () => {
    it("has no detectable a11y violations when closed", async () => {
      const { container } = await renderWithSalt(<Baseline />);
      await runAxeScan(container);
    });

    it("has no detectable a11y violations when open", async () => {
      const { container } = await renderWithSalt(<Baseline />);
      await trigger().click();
      await expect
        .element(page.getByRole("region", { name: "Solutions menu" }))
        .toBeInTheDocument();
      await runAxeScan(container);
    });

    it("has no detectable a11y violations with content regions and an action bar open", async () => {
      const { container } = await renderWithSalt(<WithRegionsLayout />);
      await expect
        .element(page.getByRole("region", { name: "Solutions menu" }))
        .toBeInTheDocument();
      await runAxeScan(container);
    });
  });
});
