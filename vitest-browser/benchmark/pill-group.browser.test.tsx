import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as pillGroupStories from "~stories/pill/pill-group.stories";

import { renderWithSalt } from "../render";

const {
  Default,
  ControlledSelectableGroup,
  SelectableGroupWithDisabledPill,
  SelectableGroup,
  WithDisabledFormField,
  Disabled,
  DisabledSelectableGroup,
} = composeStories(pillGroupStories);

const pill = (number: number) =>
  page.getByRole("checkbox", { name: `Pill ${number}` });

function expectSelection(spy: ReturnType<typeof vi.fn>, selection: string[]) {
  expect(spy).toHaveBeenLastCalledWith(expect.anything(), selection);
}

async function expectAllChecked(checked: boolean) {
  for (const element of await page.getByRole("checkbox").elements()) {
    expect(element).toHaveAttribute("aria-checked", String(checked));
  }
}

describe("GIVEN a PillGroup", () => {
  it("THEN should render pills as buttons by default", async () => {
    await renderWithSalt(<Default />);
    expect(await page.getByRole("button").elements()).toHaveLength(3);
  });

  it("THEN should render pills as checkboxes when selectionVariant is multiple", async () => {
    await renderWithSalt(<SelectableGroup />);
    expect(await page.getByRole("checkbox").elements()).toHaveLength(3);
  });

  it("SHOULD render a disabled pill", async () => {
    await renderWithSalt(<SelectableGroupWithDisabledPill />);
    await expect.element(pill(1)).toBeDisabled();
    await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
  });

  it("SHOULD render a disabled PillGroup", async () => {
    await renderWithSalt(<Disabled />);
    for (const button of await page.getByRole("button").elements())
      expect(button).toBeDisabled();
  });

  it("SHOULD render a disabled selectable PillGroup", async () => {
    await renderWithSalt(<DisabledSelectableGroup />);
    for (const checkbox of await page.getByRole("checkbox").elements())
      expect(checkbox).toBeDisabled();
  });

  describe("GIVEN a PillGroup with selectable pills", () => {
    it("THEN should allow selecting and deselecting Pills using keyboard", async () => {
      const spy = vi.fn();
      await renderWithSalt(<SelectableGroup onSelectionChange={spy} />);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      expectSelection(spy, ["one"]);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      expectSelection(spy, ["one", "two"]);
      await userEvent.keyboard(" ");
      expectSelection(spy, ["one"]);
    });

    it("THEN should allow selecting and deselecting Pills using a mouse", async () => {
      const spy = vi.fn();
      await renderWithSalt(<SelectableGroup onSelectionChange={spy} />);
      await page.getByText("Pill 1").click();
      expectSelection(spy, ["one"]);
      await page.getByText("Pill 2").click();
      expectSelection(spy, ["one", "two"]);
      await page.getByText("Pill 1").click();
      expectSelection(spy, ["two"]);
    });
  });

  it("SHOULD allow navigation with the Tab key when selectionVariant is multiple", async () => {
    await renderWithSalt(<SelectableGroup />);
    await userEvent.tab();
    await expect.element(pill(1)).toHaveFocus();
    await userEvent.tab();
    await expect.element(pill(2)).toHaveFocus();
  });

  it("SHOULD focus the first pill when group receives focus when multiple are checked", async () => {
    await renderWithSalt(<SelectableGroup selected={["two", "three"]} />);
    await userEvent.tab();
    await expect.element(pill(1)).toHaveFocus();
    await userEvent.tab();
    await expect.element(pill(2)).toHaveFocus();
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultSelected", async () => {
      await renderWithSalt(<SelectableGroup defaultSelected={["one"]} />);
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
      await expect.element(pill(2)).toHaveAttribute("aria-checked", "false");
      await expect.element(pill(3)).toHaveAttribute("aria-checked", "false");
    });

    it("SHOULD toggle pills using a mouse", async () => {
      await renderWithSalt(<SelectableGroup />);
      await expectAllChecked(false);
      await pill(1).click();
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
      await pill(1).click();
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
      await pill(1).click();
      await pill(2).click();
      await pill(3).click();
      await expectAllChecked(true);
    });

    it("SHOULD call onSelectionChange when clicking a pill", async () => {
      const spy = vi.fn();
      await renderWithSalt(<SelectableGroup onSelectionChange={spy} />);
      await pill(2).click();
      expectSelection(spy, ["two"]);
    });

    it("SHOULD toggle pills when using the Space key", async () => {
      await renderWithSalt(<SelectableGroup />);
      await expectAllChecked(false);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
      await userEvent.keyboard(" ");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
      await userEvent.keyboard(" ");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
    });

    it("SHOULD call onSelectionChange when activating with keyboard", async () => {
      const spy = vi.fn();
      await renderWithSalt(<SelectableGroup onSelectionChange={spy} />);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      expectSelection(spy, ["one"]);
    });

    it("should NOT toggle pills using the Enter key", async () => {
      await renderWithSalt(<SelectableGroup />);
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should respect selected", async () => {
      await renderWithSalt(<ControlledSelectableGroup />);
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
      await expect.element(pill(2)).toHaveAttribute("aria-checked", "false");
      await expect.element(pill(3)).toHaveAttribute("aria-checked", "true");
    });

    it("SHOULD toggle pills using a mouse", async () => {
      await renderWithSalt(<ControlledSelectableGroup />);
      await pill(1).click();
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
      await pill(2).click();
      await expect.element(pill(2)).toHaveAttribute("aria-checked", "true");
    });

    it("SHOULD toggle pills when using the Space key", async () => {
      await renderWithSalt(<ControlledSelectableGroup />);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
      await userEvent.keyboard(" ");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
      await userEvent.keyboard(" ");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "false");
    });

    it("should NOT toggle pills using the Enter key", async () => {
      await renderWithSalt(<ControlledSelectableGroup />);
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect.element(pill(1)).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", async () => {
      await renderWithSalt(
        <WithDisabledFormField selectionVariant="multiple" />,
      );
      for (const checkbox of await page.getByRole("checkbox").elements())
        expect(checkbox).toBeDisabled();
    });

    it("THEN should have the correct aria labelling", async () => {
      await renderWithSalt(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Default />
          <FormFieldHelperText>Description</FormFieldHelperText>
        </FormField>,
      );
      const group = page.getByRole("group");
      await expect.element(group).toHaveAccessibleName("Label");
      await expect.element(group).toHaveAccessibleDescription("Description");
    });
  });
});
