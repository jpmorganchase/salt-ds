import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as ratingStories from "~stories/rating/rating.stories";

import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(ratingStories);
const {
  Default,
  ReadOnly,
  Disabled,
  CustomIcons,
  Controlled,
  FormFieldSupport,
} = composedStories;
const radio = (name: string) => page.getByRole("radio", { name });

function expectChange(spy: ReturnType<typeof vi.fn>, value: number) {
  expect(spy).toHaveBeenLastCalledWith(expect.anything(), value);
}

async function exerciseKeyboard(Story: typeof Default | typeof Controlled) {
  const spy = vi.fn();
  await renderWithSalt(<Story onChange={spy} />);
  for (const element of await page.getByRole("radio").elements())
    expect(element).not.toBeChecked();
  await userEvent.tab();
  await expect.element(radio("1 Star")).not.toBeChecked();
  await userEvent.keyboard("{Enter}");
  await expect.element(radio("1 Star")).not.toBeChecked();
  expect(spy).not.toHaveBeenCalled();
  await userEvent.keyboard(" ");
  await expect.element(radio("1 Star")).toBeChecked();
  expectChange(spy, 1);
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(radio("2 Stars")).toBeChecked();
  expectChange(spy, 2);
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(radio("3 Stars")).toBeChecked();
  expectChange(spy, 3);
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(radio("2 Stars")).toBeChecked();
  expectChange(spy, 2);
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(radio("1 Star")).toBeChecked();
  expectChange(spy, 1);
}

describe("GIVEN a Rating component", () => {
  checkAccessibility(composedStories);

  it("SHOULD have the correct accessibility attributes", async () => {
    await renderWithSalt(
      <Default aria-label="rating label" name="custom-name" max={10} />,
    );
    await expect
      .element(page.getByRole("radiogroup", { name: "rating label" }))
      .toBeVisible();
    const radios = await page.getByRole("radio").elements();
    expect(radios).toHaveLength(10);
    for (const [index, element] of radios.entries()) {
      const value = index + 1;
      expect(element).not.toBeChecked();
      expect(element).toHaveAttribute("name", "custom-name");
      expect(element).toHaveAttribute(
        "aria-label",
        `${value} Star${value > 1 ? "s" : ""}`,
      );
    }
  });

  it("THEN should have correct tab order", async () => {
    await renderWithSalt(
      <>
        <button type="button">Before</button>
        <Default defaultValue={4} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Before" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(radio("4 Stars")).toHaveFocus();
    await expect.element(radio("4 Stars")).toBeChecked();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
  });

  it("THEN should handle max value of 0", async () => {
    await renderWithSalt(<Default max={0} />);
    expect(await page.getByRole("radio").elements()).toHaveLength(0);
  });

  describe("WHEN mounted as a controlled component", () => {
    it("SHOULD have correct value", async () => {
      await renderWithSalt(<Default value={4} />);
      await expect.element(radio("4 Stars")).toBeChecked();
      await expect.element(radio("4 Stars")).toHaveAttribute("value", "4");
    });

    it("THEN should handle selection using a mouse", async () => {
      const spy = vi.fn();
      await renderWithSalt(<Controlled onChange={spy} />);
      await radio("2 Stars").click();
      await expect.element(radio("2 Stars")).toBeChecked();
      expectChange(spy, 2);
      await radio("4 Stars").click();
      await expect.element(radio("4 Stars")).toBeChecked();
      expectChange(spy, 4);
    });

    it("THEN should handle selection using keyboard", async () => {
      await exerciseKeyboard(Controlled);
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should change value when clicked", async () => {
      const spy = vi.fn();
      await renderWithSalt(<Default defaultValue={3} onChange={spy} />);
      await expect.element(radio("3 Stars")).toBeChecked();
      await expect.element(radio("3 Stars")).toHaveAttribute("value", "3");
      await radio("2 Stars").click();
      await expect.element(radio("2 Stars")).toBeChecked();
      expectChange(spy, 2);
      await radio("4 Stars").click();
      await expect.element(radio("4 Stars")).toBeChecked();
      expectChange(spy, 4);
    });

    it("THEN should handle selection using keyboard", async () => {
      await exerciseKeyboard(Default);
    });

    it("THEN should wrap around values with arrow keys", async () => {
      const spy = vi.fn();
      await renderWithSalt(<Default onChange={spy} />);
      await userEvent.tab();
      await expect.element(radio("1 Star")).toHaveFocus();
      await userEvent.keyboard("{ArrowLeft}");
      await expect.element(radio("5 Stars")).toHaveFocus();
      await expect.element(radio("5 Stars")).toBeChecked();
      expectChange(spy, 5);
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(radio("1 Star")).toHaveFocus();
      await expect.element(radio("1 Star")).toBeChecked();
      expectChange(spy, 1);
    });
  });

  describe("WHEN disabled", () => {
    it("SHOULD not be interactive", async () => {
      const spy = vi.fn();
      await renderWithSalt(<Disabled onChange={spy} />);
      for (const element of await page.getByRole("radio").elements())
        expect(element).toBeDisabled();
      ((await radio("1 Star").element()) as HTMLElement).click();
      expect(spy).not.toHaveBeenCalled();
      await expect.element(radio("1 Star")).not.toBeChecked();
    });

    it("SHOULD not receive focus", async () => {
      await renderWithSalt(
        <>
          <button type="button">Before</button>
          <Disabled />
          <button type="button">After</button>
        </>,
      );
      await page.getByRole("button", { name: "Before" }).click();
      await userEvent.tab();
      for (const element of await page.getByRole("radio").elements())
        expect(element).not.toHaveFocus();
      await expect
        .element(page.getByRole("button", { name: "After" }))
        .toHaveFocus();
    });
  });

  describe("WHEN read-only", () => {
    it("SHOULD be focusable", async () => {
      const spy = vi.fn();
      await renderWithSalt(<ReadOnly defaultValue={3} onChange={spy} />);
      for (const element of await page.getByRole("radio").elements())
        expect(element).toHaveAttribute("readonly");
      await userEvent.tab();
      await expect.element(radio("3 Stars")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(radio("4 Stars")).toHaveFocus();
      await userEvent.keyboard("{ArrowLeft}");
      await expect.element(radio("3 Stars")).toHaveFocus();
      expect(spy).not.toHaveBeenCalled();
    });

    it("SHOULD not update visible label on hover when read-only", async () => {
      const spy = vi.fn();
      await renderWithSalt(
        <ReadOnly
          defaultValue={2}
          getVisibleLabel={(value, max) => `${value}/${max}`}
          onChange={spy}
        />,
      );
      await expect.element(page.getByText("2/5")).toBeVisible();
      await radio("4 Stars").hover();
      await expect.element(page.getByText("2/5")).toBeVisible();
      await radio("4 Stars").click();
      expect(spy).not.toHaveBeenCalled();
      await expect.element(page.getByText("2/5")).toBeVisible();
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", async () => {
      const spy = vi.fn();
      await renderWithSalt(<FormFieldSupport disabled onChange={spy} />);
      await expect
        .element(page.getByRole("radiogroup", { name: "Form field label" }))
        .toBeVisible();
      for (const element of await page.getByRole("radio").elements())
        expect(element).toBeDisabled();
      ((await radio("Poor").element()) as HTMLElement).click();
      expect(spy).not.toHaveBeenCalled();
    });

    it("THEN should respect the context when read-only", async () => {
      const spy = vi.fn();
      await renderWithSalt(<FormFieldSupport onChange={spy} readOnly />);
      await expect
        .element(page.getByRole("radiogroup", { name: "Form field label" }))
        .toBeVisible();
      for (const element of await page.getByRole("radio").elements())
        expect(element).toHaveAttribute("readonly");
      await radio("Poor").click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it("THEN should render custom icons", async () => {
    await renderWithSalt(<CustomIcons />);
    expect(await page.getByTestId("LikeSolidIcon").elements()).toHaveLength(3);
    expect(await page.getByTestId("LikeIcon").elements()).toHaveLength(2);
  });

  it("THEN should update visible label on hover and selection", async () => {
    const spy = vi.fn();
    await renderWithSalt(
      <Default
        getLabel={(value) => `Level ${value}`}
        getVisibleLabel={(value, max) => `${value}/${max}`}
        onChange={spy}
      />,
    );
    await expect.element(page.getByText("0/5")).toBeVisible();
    await radio("Level 2").hover();
    await expect.element(page.getByText("2/5")).toBeVisible();
    await radio("Level 3").hover();
    await expect.element(page.getByText("3/5")).toBeVisible();
    await radio("Level 4").click();
    expectChange(spy, 4);
    await expect.element(radio("Level 4")).toBeChecked();
    await expect.element(page.getByText("4/5")).toBeVisible();
    await userEvent.unhover(await page.getByRole("radiogroup").element());
    await expect.element(page.getByText("4/5")).toBeVisible();
  });
});
