import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { type Locator, page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as megaMenuStories from "~stories/mega-menu/mega-menu.stories";

const {
  Baseline,
  WithAside,
  WithLeadingAside,
  WithActions,
  WithActionsAndNextTrigger,
  StaticContent,
  WithActionItem,
  WithRenderProp,
} = composeStories(megaMenuStories);

const trigger = (name = "Solutions") => page.getByRole("button", { name });
const link = (name: string) => page.getByRole("link", { name });
const button = (name: string) => page.getByRole("button", { name });

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

async function expectFocus(locator: Locator) {
  await expect.element(locator).toHaveFocus();
}

async function press(keys: string) {
  await userEvent.keyboard(keys);
}

async function focusTrigger(name = "Solutions") {
  trigger(name).element().focus();
  await expectFocus(trigger(name));
}

async function openSolutions(
  Story: typeof Baseline = Baseline,
  name = "Solutions",
) {
  await renderWithSalt(<Story />);
  await focusTrigger(name);
  await press("{Enter}");
  await expectPanel(true);
}

describe("Given a MegaMenu", () => {
  describe("when focus is on the trigger and menu is closed", () => {
    it.each([
      ["Enter", "{Enter}"],
      ["Space", " "],
      ["ArrowDown", "{ArrowDown}"],
    ])("opens on %s", async (_name, key) => {
      await renderWithSalt(<Baseline />);
      await focusTrigger();
      await press(key);
      await expectPanel(true);
    });

    it("does not open on Tab", async () => {
      await renderWithSalt(<Baseline />);
      await focusTrigger();
      await press("{Tab}");
      await expectPanel(false);
    });

    it("moves focus to next trigger on ArrowRight", async () => {
      await renderWithSalt(<Baseline />);
      await focusTrigger();
      await press("{ArrowRight}");
      await expectFocus(trigger("Services"));
      await expectPanel(false);
    });

    it("moves focus to previous trigger on ArrowLeft", async () => {
      await renderWithSalt(<Baseline />);
      await focusTrigger("Services");
      await press("{ArrowLeft}");
      await expectFocus(trigger());
      await expectPanel(false);
    });
  });

  describe("when menu is open", () => {
    it.each([
      ["Tab", "{Tab}"],
      ["ArrowDown", "{ArrowDown}"],
    ])("moves focus to first item on %s from trigger", async (_name, key) => {
      await openSolutions();
      await press(key);
      await expectFocus(link("Digital Banking"));
    });

    it("ArrowRight on an open trigger closes the panel and moves to the next trigger", async () => {
      await openSolutions();
      await press("{ArrowRight}");
      await expectFocus(trigger("Services"));
      await expectPanel(false);
    });

    it("ArrowLeft on an open trigger closes the panel and moves to the previous trigger", async () => {
      await openSolutions(Baseline, "Services");
      await press("{ArrowLeft}");
      await expectFocus(trigger());
      await expectPanel(false);
    });

    it("Shift+Tab on an open trigger closes the panel and moves to the previous trigger", async () => {
      await openSolutions(Baseline, "Services");
      await press("{Shift>}{Tab}{/Shift}");
      await expectFocus(trigger());
      await expectPanel(false);
    });

    it("re-enters items on ArrowDown after ArrowUp returns to trigger (opened via ArrowDown)", async () => {
      await renderWithSalt(<Baseline />);
      await focusTrigger();
      await press("{ArrowDown}");
      await expectPanel(true);
      await expectFocus(link("Digital Banking"));
      await press("{ArrowUp}");
      await expectFocus(trigger());
      await press("{ArrowDown}");
      await expectFocus(link("Digital Banking"));
    });

    it("supports ArrowDown and ArrowUp between items and trigger", async () => {
      await openSolutions();
      await press("{Tab}");
      await expectFocus(link("Digital Banking"));
      await press("{ArrowDown}");
      await expectFocus(link("Risk Management"));
      await press("{ArrowUp}");
      await expectFocus(link("Digital Banking"));
      await press("{ArrowUp}");
      await expectFocus(trigger());
    });

    it("moves to the next column on ArrowDown from the last item of a non-last column", async () => {
      await openSolutions();
      await press("{Tab}{ArrowDown}");
      await expectFocus(link("Risk Management"));
      await press("{ArrowDown}");
      await expectFocus(link("Patient Management"));
    });

    it("crosses columns with ArrowRight and ArrowLeft", async () => {
      await openSolutions();
      await press("{Tab}{ArrowRight}");
      await expectFocus(link("Patient Management"));
      await press("{ArrowLeft}");
      await expectFocus(link("Digital Banking"));
    });

    it.each([
      ["ArrowUp", "{ArrowUp}"],
      ["ArrowLeft", "{ArrowLeft}"],
    ])(
      "%s on the first item returns focus to the trigger and keeps the menu open",
      async (_name, key) => {
        await openSolutions();
        await press(`{Tab}${key}`);
        await expectFocus(trigger());
        await expectPanel(true);
      },
    );

    it("ArrowDown from the bottom of the last column is a no-op when there is no next trigger", async () => {
      await openSolutions(Baseline, "Services");
      await press("{Tab}{ArrowDown}{ArrowDown}");
      await expectFocus(link("Operations"));
      await expectPanel(true);
    });

    it("ArrowRight from the bottom of the last column returns to the current trigger when there is no next trigger", async () => {
      await openSolutions(Baseline, "Services");
      await press("{Tab}{ArrowDown}{ArrowRight}");
      await expectFocus(trigger("Services"));
      await expectPanel(true);
    });

    it("ArrowRight from a non-bottom item of the last column returns to the current trigger", async () => {
      await openSolutions();
      await press("{Tab}{ArrowRight}");
      await expectFocus(link("Patient Management"));
      await press("{ArrowRight}");
      await expectFocus(trigger());
      await expectPanel(true);
    });

    it.each([
      ["ArrowRight", "{ArrowRight}"],
      ["ArrowDown", "{ArrowDown}"],
    ])(
      "%s from the bottom of the last column closes menu and moves to next trigger",
      async (_name, key) => {
        await openSolutions();
        await press("{Tab}{ArrowRight}{ArrowDown}");
        await expectFocus(link("Telemedicine"));
        await press(key);
        await expectPanel(false);
        await expectFocus(trigger("Services"));
      },
    );

    it("supports Tab and Shift+Tab inside menu", async () => {
      await openSolutions();
      await press("{Tab}{Tab}");
      await expectFocus(link("Risk Management"));
      await press("{Shift>}{Tab}{/Shift}");
      await expectFocus(link("Digital Banking"));
    });

    it("returns focus to trigger on Shift+Tab from first item and Tab re-enters first item", async () => {
      await openSolutions();
      await press("{Tab}{Shift>}{Tab}{/Shift}");
      await expectFocus(trigger());
      await press("{Tab}");
      await expectFocus(link("Digital Banking"));
    });

    it("activates item on Enter and closes menu", async () => {
      await openSolutions();
      await press("{Tab}{Enter}");
      await expectPanel(false);
    });

    it("does not activate an item on Space (links activate on Enter only)", async () => {
      await openSolutions();
      await press("{Tab}");
      await expectFocus(link("Digital Banking"));
      await press(" ");
      await expectPanel(true);
      await expectFocus(link("Digital Banking"));
    });

    it("tabs from the last item to the next trigger and closes the panel", async () => {
      await openSolutions();
      await press("{Tab}{Tab}{Tab}{Tab}");
      await expectFocus(link("Telemedicine"));
      await press("{Tab}");
      await expectFocus(trigger("Services"));
      await expectPanel(false);
    });

    it("closes on Escape when focus is still on the trigger", async () => {
      await openSolutions();
      await press("{Escape}");
      await expectPanel(false);
      await expectFocus(trigger());
    });

    it.each([
      ["Home", "{ArrowDown}{Home}", "Digital Banking"],
      ["End", "{End}", "Risk Management"],
    ])("supports %s within a column", async (_name, keys, expected) => {
      await openSolutions();
      await press(`{Tab}${keys}`);
      await expectFocus(link(expected));
    });

    it("returns focus to trigger on Escape", async () => {
      await openSolutions();
      await press("{Tab}");
      await expectFocus(link("Digital Banking"));
      await press("{Escape}");
      await expectPanel(false);
      await expectFocus(trigger());
    });

    it("renders an action item (render={<button/>}) as a focusable button", async () => {
      await openSolutions(WithActionItem);
      await press("{ArrowDown}");
      await expectFocus(button("Action button"));
      await press("{ArrowDown}");
      await expectFocus(link("Digital Banking"));
    });

    it("treats the render prop element as the focusable target", async () => {
      await openSolutions(WithRenderProp);
      await press("{Tab}");
      await expectFocus(link("Digital Banking"));
      await expect
        .element(link("Digital Banking"))
        .toHaveAttribute("data-custom-link");
    });

    it("renders no duplicate anchor when using render", async () => {
      await renderWithSalt(<WithRenderProp />);
      await trigger().click();
      expect(
        document.querySelectorAll(
          ".saltMegaMenuPanel a.saltMegaMenuListItem-wrapper",
        ),
      ).toHaveLength(1);
    });
  });

  describe("when the menu has a side region", () => {
    it("includes the region's interactive elements in the Tab sequence, in layout order", async () => {
      await openSolutions(WithAside);
      for (const locator of [
        link("Digital Banking"),
        link("Risk Management"),
        link("See all solutions"),
        button("Contact sales"),
      ]) {
        await press("{Tab}");
        await expectFocus(locator);
      }
    });

    it("does not put the region wrapper itself in the tab order", async () => {
      await openSolutions(WithAside);
      expect(document.querySelector(".saltMegaMenuAside")).not.toHaveAttribute(
        "tabindex",
      );
    });

    it("crosses into the region column with ArrowRight and within it with ArrowDown", async () => {
      await openSolutions(WithAside);
      await press("{Tab}{ArrowRight}");
      await expectFocus(link("See all solutions"));
      await press("{ArrowDown}");
      await expectFocus(button("Contact sales"));
      await press("{ArrowRight}");
      await expectFocus(trigger());
      await expectPanel(true);
    });

    it("tabs out of the menu and closes it after the last region element", async () => {
      await openSolutions(WithAside);
      await press("{Tab}{Tab}{Tab}{Tab}");
      await expectFocus(button("Contact sales"));
      await press("{Tab}");
      await expectPanel(false);
      await expectFocus(button("After Nav"));
    });

    it("walks Shift+Tab backwards through region elements without losing focus", async () => {
      await openSolutions(WithAside);
      await press("{Tab}{Tab}{Tab}{Tab}");
      for (const locator of [
        link("See all solutions"),
        link("Risk Management"),
        link("Digital Banking"),
        trigger(),
      ]) {
        await press("{Shift>}{Tab}{/Shift}");
        await expectFocus(locator);
      }
      await expectPanel(true);
    });

    it("treats a leading region as the first column and returns to the trigger on ArrowLeft", async () => {
      await openSolutions(WithLeadingAside);
      await press("{Tab}");
      await expectFocus(link("Featured"));
      await press("{ArrowRight}");
      await expectFocus(link("Digital Banking"));
      await press("{ArrowLeft}");
      await expectFocus(link("Featured"));
      await press("{ArrowLeft}");
      await expectFocus(trigger());
      await expectPanel(true);
    });
  });

  describe("when the menu has an action bar", () => {
    async function focusFirstAction(Story: typeof Baseline = WithActions) {
      await openSolutions(Story);
      await press("{Tab}{ArrowDown}{ArrowDown}");
      await expectFocus(link("Book a demo"));
    }

    it("crosses from the column grid into a bottom action bar on ArrowDown and moves within it", async () => {
      await focusFirstAction();
      await press("{ArrowRight}");
      await expectFocus(button("Support center"));
      await press("{ArrowLeft}");
      await expectFocus(link("Book a demo"));
    });

    it("crosses from a bottom action bar back into the column grid on ArrowUp", async () => {
      await focusFirstAction();
      await press("{ArrowUp}");
      await expectFocus(link("Risk Management"));
    });

    it("has no effect on ArrowDown from the last action when there is no next trigger", async () => {
      await focusFirstAction();
      await press("{ArrowRight}{ArrowDown}");
      await expectFocus(button("Support center"));
      await expectPanel(true);
    });

    it("returns to the current trigger on ArrowRight from the last action when there is no next trigger", async () => {
      await focusFirstAction();
      await press("{ArrowRight}{ArrowRight}");
      await expectFocus(trigger());
      await expectPanel(true);
    });

    it.each([
      ["ArrowRight", "{ArrowRight}"],
      ["ArrowDown", "{ArrowDown}"],
    ])(
      "exits to the next trigger on %s from the last action",
      async (_name, key) => {
        await openSolutions(WithActionsAndNextTrigger);
        await press("{Tab}{ArrowDown}{ArrowRight}");
        await expectFocus(button("Support center"));
        await press(key);
        await expectPanel(false);
        await expectFocus(trigger("Services"));
      },
    );

    it("supports Home and End within an action bar", async () => {
      await focusFirstAction();
      await press("{End}");
      await expectFocus(button("Support center"));
      await press("{Home}");
      await expectFocus(link("Book a demo"));
    });

    it("does not put the action bar wrapper itself in the tab order", async () => {
      await openSolutions(WithActions);
      expect(
        document.querySelector(".saltMegaMenuActions"),
      ).not.toHaveAttribute("tabindex");
    });
  });

  describe("when the menu has static-only content", () => {
    it("excludes a static-only region and action bar from the Tab sequence", async () => {
      await openSolutions(StaticContent);
      await press("{Tab}{Tab}");
      await expectFocus(link("Risk Management"));
      await press("{Tab}");
      await expectPanel(false);
      await expectFocus(button("After Nav"));
    });

    it("does not cross into static content with arrow keys", async () => {
      await openSolutions(StaticContent);
      await press("{Tab}{ArrowDown}{ArrowDown}");
      await expectFocus(link("Risk Management"));
      await press("{ArrowRight}");
      await expectFocus(trigger());
      await expectPanel(true);
    });
  });
});
