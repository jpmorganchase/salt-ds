import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as tokenizedInputNextStories from "~stories/tokenized-input-next/tokenized-input-next.stories";

import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(tokenizedInputNextStories);
const { Default, WithCollapsedButton } = composedStories;
const textbox = () => page.getByRole("textbox");
const optionCount = async () =>
  (await page.getByRole("option").elements()).length;
async function focusInput() {
  (await textbox().element()).focus();
}

describe("GIVEN a Tokenized Input", () => {
  checkAccessibility(composedStories, async (children) => {
    const result = await renderWithSalt(children);
    const inputs = page.getByRole("textbox");
    if ((await inputs.elements()).length > 0) await inputs.first().hover();
    return result;
  });

  it("SHOULD mount as disabled", async () => {
    await renderWithSalt(<Default disabled />);
    await expect.element(textbox()).toBeDisabled();
  });

  it("SHOULD mount as readonly", async () => {
    await renderWithSalt(<Default defaultSelected={["Tokyo"]} readOnly />);
    await expect.element(textbox()).toHaveAttribute("readonly");
  });

  it("should not allow to remove or add items when readonly", async () => {
    await renderWithSalt(<Default defaultSelected={["Tokyo"]} readOnly />);
    await expect.element(page.getByRole("option")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowLeft}{Backspace}");
    await expect.element(page.getByRole("option")).toBeInTheDocument();
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("should render the Tokenized Input with pre selected items", async () => {
      await renderWithSalt(<WithCollapsedButton />);
      await expect.element(textbox()).toBeInTheDocument();
      await expect
        .element(page.getByTestId("expand-button"))
        .toBeInTheDocument();
    });

    it("should allow adding items by typing and pressing the delimiter", async () => {
      await renderWithSalt(<Default />);
      await textbox().fill("Tokio,");
      await expect.element(page.getByRole("option")).toBeInTheDocument();
    });

    it.skip("should highlihht pills if navigating with arrows", async () => {
      await renderWithSalt(
        <Default defaultSelected={["Tokyo", "Delhi", "Shanghai"]} />,
      );
      await focusInput();
      await userEvent.keyboard("{ArrowLeft}");
      await expect
        .element(page.getByRole("option").nth(2))
        .toHaveClass("saltInputPill-pillHighlighted");
      await userEvent.keyboard("{ArrowLeft}");
      await userEvent.keyboard("{ArrowRight}");
      await expect
        .element(page.getByRole("option").nth(1))
        .toHaveClass("saltInputPill-pillHighlighted");
    });

    it("should be able to change delimiter", async () => {
      await renderWithSalt(<Default delimiters={[";"]} />);
      await textbox().fill("Tokio, Delhi, Shanghai");
      await expect.poll(optionCount).toBe(0);
      await textbox().fill("Tokio; Delhi; Shanghai;");
      await expect.poll(optionCount).toBe(3);
    });

    it("should be able to take an array of delimiters", async () => {
      await renderWithSalt(<Default delimiters={[";", "/", "."]} />);
      await textbox().fill("Tokio, Delhi, Shanghai");
      await expect.poll(optionCount).toBe(0);
      await textbox().fill("Tokio; Delhi/ Shanghai.");
      await expect.poll(optionCount).toBe(3);
    });

    it("should allow removing items by clicking on the close button", async () => {
      await renderWithSalt(<Default defaultSelected={["Tokyo"]} />);
      await focusInput();
      await expect.element(page.getByRole("option")).toBeInTheDocument();
      await userEvent.keyboard("{ArrowLeft}{Backspace}");
      await expect.element(page.getByRole("option")).not.toBeInTheDocument();
    });

    it("should clear input on clicking the clear button", async () => {
      await renderWithSalt(<Default defaultSelected={["Tokyo"]} />);
      await focusInput();
      await page.getByTestId("clear-button").click();
      await expect.element(textbox()).toHaveValue("");
    });

    it("should expand on clicking the expand button and collapse when blur", async () => {
      await renderWithSalt(
        <>
          <WithCollapsedButton />
          <button type="button">After tokenized input</button>
        </>,
      );
      await focusInput();
      await expect.poll(optionCount).toBe(50);
      const pills = page.getByTestId("pill");
      const afterInput = page.getByRole("button", {
        name: "After tokenized input",
      });
      await expect.element(pills.nth(49)).toBeVisible();
      await userEvent.tab();
      await userEvent.tab();
      await expect.element(afterInput).toHaveFocus();
      await expect.element(textbox()).not.toHaveFocus();
      await expect.element(pills).toHaveLength(50);
      await expect.element(pills.nth(49)).not.toBeVisible();
    });

    it("should not display the clear button if there is no selection", async () => {
      await renderWithSalt(<Default />);
      await expect
        .element(page.getByTestId("clear-button"))
        .not.toBeInTheDocument();
    });

    it("should return focus to input if an item is closed", async () => {
      await renderWithSalt(<Default defaultSelected={["Tokyo"]} />);
      await focusInput();
      await page.getByTestId("clear-button").click();
      await expect.element(textbox()).toHaveFocus();
    });

    it("should trigger event callbacks when actions are prompted", async () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      const onExpand = vi.fn();
      const onCollapse = vi.fn();
      await renderWithSalt(
        <WithCollapsedButton
          onChange={onChange}
          onClear={onClear}
          onExpand={onExpand}
          onCollapse={onCollapse}
        />,
      );
      await page.getByTestId("expand-button").click();
      await userEvent.tab();
      await userEvent.tab();
      await focusInput();
      await page.getByTestId("clear-button").click();
      await textbox().fill("Tokio,");
      await expect
        .element(page.getByRole("option").first())
        .toBeInTheDocument();
      expect(onClear).toHaveBeenCalled();
      expect(onExpand).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN have the specified value", async () => {
      await renderWithSalt(
        <Default defaultSelected={["Delhi"]} value="Tokio" />,
      );
      await expect.element(textbox()).toHaveValue("Tokio");
    });

    it("SHOULD call onChange with the new value", async () => {
      const changeSpy = vi.fn();
      await renderWithSalt(
        <Default
          defaultSelected={["Delhi"]}
          value="Tokio"
          onChange={changeSpy}
        />,
      );
      await textbox().fill("Mexico City,");
      expect(changeSpy).toHaveBeenCalled();
    });
  });
});
