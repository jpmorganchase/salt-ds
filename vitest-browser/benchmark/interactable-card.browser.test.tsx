import {
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardGroupProps,
  type InteractableCardValue,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type SyntheticEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as cardStories from "~stories/interactable-card/interactable-card.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(cardStories);
const { Default } = composedStories;

function Cards(props: InteractableCardGroupProps) {
  return (
    <InteractableCardGroup {...props}>
      <InteractableCard value="one">One</InteractableCard>
      <InteractableCard value="two">Two</InteractableCard>
      <InteractableCard value="three">Three</InteractableCard>
    </InteractableCardGroup>
  );
}

function ControlledCards({
  disabled,
  multiSelect,
  onChange,
}: Pick<InteractableCardGroupProps, "disabled" | "multiSelect" | "onChange">) {
  const [value, setValue] = useState<InteractableCardValue>(
    multiSelect ? [] : "",
  );
  const handleChange = (
    event: SyntheticEvent<HTMLDivElement>,
    nextValue: InteractableCardValue,
  ) => {
    event.persist();
    setValue(nextValue);
    onChange?.(event, nextValue);
  };
  return (
    <Cards
      disabled={disabled}
      multiSelect={multiSelect}
      onChange={handleChange}
      value={value}
    />
  );
}

const cards = (multiSelect: boolean) =>
  page.getByRole(multiSelect ? "checkbox" : "radio");
const card = (name: string, multiSelect: boolean) =>
  page.getByRole(multiSelect ? "checkbox" : "radio", { name });

async function expectChecked(
  name: string,
  multiSelect: boolean,
  checked: boolean,
) {
  await expect
    .element(card(name, multiSelect))
    .toHaveAttribute("aria-checked", String(checked));
}

describe("Given an Interactable Card", () => {
  checkAccessibility(composedStories);

  it("renders its content", async () => {
    await renderWithSalt(<Default />);
    await expect
      .element(page.getByText("Sustainable investing products"))
      .toBeVisible();
    await expect
      .element(page.getByText(/commitment to provide a wide range/))
      .toBeVisible();
  });
});

describe("GIVEN a multiselect InteractableCardGroup", () => {
  it("renders checkbox cards with values", async () => {
    await renderWithSalt(<Cards multiSelect />);
    expect(await cards(true).elements()).toHaveLength(3);
    for (const [index, value] of ["one", "two", "three"].entries())
      await expect
        .element(cards(true).nth(index))
        .toHaveAttribute("data-value", value);
  });

  it("tabs through cards without wrapping", async () => {
    await renderWithSalt(
      <>
        <button type="button">Before</button>
        <Cards multiSelect />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Before" }))
      .toHaveFocus();
    for (const name of ["One", "Two", "Three"]) {
      await userEvent.tab();
      await expect.element(card(name, true)).toHaveFocus();
    }
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
  });

  it("shift-tabs backwards without wrapping", async () => {
    await renderWithSalt(
      <>
        <button type="button">Before</button>
        <Cards multiSelect />
        <button type="button">After</button>
      </>,
    );
    page.getByRole("button", { name: "After" }).element().focus();
    for (const name of ["Three", "Two", "One"]) {
      await userEvent.tab({ shift: true });
      await expect.element(card(name, true)).toHaveFocus();
    }
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("button", { name: "Before" }))
      .toHaveFocus();
  });

  it("skips disabled cards", async () => {
    await renderWithSalt(
      <InteractableCardGroup multiSelect>
        <InteractableCard disabled value="one">
          One
        </InteractableCard>
        <InteractableCard value="two">Two</InteractableCard>
      </InteractableCardGroup>,
    );
    await userEvent.tab();
    await expect.element(card("Two", true)).toHaveFocus();
  });

  it("respects defaultValue", async () => {
    await renderWithSalt(<Cards multiSelect defaultValue={["one", "three"]} />);
    await expectChecked("One", true, true);
    await expectChecked("Two", true, false);
    await expectChecked("Three", true, true);
  });

  it.each(["mouse", "keyboard"])(
    "toggles uncontrolled cards with %s",
    async (interaction) => {
      const onChange = vi.fn();
      await renderWithSalt(<Cards multiSelect onChange={onChange} />);
      if (interaction === "mouse") {
        for (const name of ["One", "Two", "Three"])
          await card(name, true).click();
      } else {
        await userEvent.tab();
        for (let index = 0; index < 3; index += 1) {
          await userEvent.keyboard(" ");
          if (index < 2) await userEvent.tab();
        }
      }
      for (const name of ["One", "Two", "Three"])
        await expectChecked(name, true, true);
      expect(onChange.mock.lastCall?.[1]).toEqual(["one", "two", "three"]);
    },
  );

  it.each(["mouse", "keyboard"])(
    "toggles controlled cards with %s",
    async (interaction) => {
      const onChange = vi.fn();
      await renderWithSalt(<ControlledCards multiSelect onChange={onChange} />);
      if (interaction === "mouse") {
        await card("One", true).click();
        await card("Two", true).click();
      } else {
        await userEvent.tab();
        await userEvent.keyboard(" ");
        await userEvent.tab();
        await userEvent.keyboard(" ");
      }
      await expectChecked("One", true, true);
      await expectChecked("Two", true, true);
      expect(onChange.mock.lastCall?.[1]).toEqual(["one", "two"]);
    },
  );

  it("does not toggle disabled cards or groups", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <InteractableCardGroup multiSelect disabled onChange={onChange}>
        <InteractableCard value="one">One</InteractableCard>
      </InteractableCardGroup>,
    );
    await card("One", true).click({ force: true });
    await expectChecked("One", true, false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not toggle with Enter", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Cards multiSelect onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expectChecked("One", true, false);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("GIVEN a single-select InteractableCardGroup", () => {
  it("renders radio cards", async () => {
    await renderWithSalt(<Cards />);
    expect(await cards(false).elements()).toHaveLength(3);
  });

  it("uses one tab stop and exits the group", async () => {
    await renderWithSalt(
      <>
        <button type="button">Before</button>
        <Cards />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(card("One", false)).toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(card("One", false)).toHaveFocus();
  });

  it("skips a disabled first card", async () => {
    await renderWithSalt(
      <InteractableCardGroup>
        <InteractableCard disabled value="one">
          One
        </InteractableCard>
        <InteractableCard value="two">Two</InteractableCard>
      </InteractableCardGroup>,
    );
    await userEvent.tab();
    await expect.element(card("Two", false)).toHaveFocus();
  });

  it("selects and focuses with arrow keys", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Cards onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(card("Two", false)).toHaveFocus();
    await expectChecked("Two", false, true);
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(card("One", false)).toHaveFocus();
    await expectChecked("One", false, true);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("selects with Space when initially empty", async () => {
    await renderWithSalt(<Cards />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expectChecked("One", false, true);
  });

  it("respects defaultValue", async () => {
    await renderWithSalt(<Cards defaultValue="two" />);
    await expectChecked("One", false, false);
    await expectChecked("Two", false, true);
    await expect.element(card("Two", false)).toHaveAttribute("tabindex", "0");
  });

  it.each(["uncontrolled", "controlled"])(
    "selects only one card in %s mode",
    async (mode) => {
      const onChange = vi.fn();
      await renderWithSalt(
        mode === "controlled" ? (
          <ControlledCards onChange={onChange} />
        ) : (
          <Cards onChange={onChange} />
        ),
      );
      await card("One", false).click();
      await card("Three", false).click();
      await expectChecked("One", false, false);
      await expectChecked("Three", false, true);
      expect(onChange.mock.lastCall?.[1]).toBe("three");
    },
  );

  it("does not select disabled groups", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Cards disabled onChange={onChange} />);
    await card("One", false).click({ force: true });
    await expectChecked("One", false, false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
