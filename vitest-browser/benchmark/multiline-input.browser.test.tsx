import { composeStories } from "@storybook/react-vite";
import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as multilineInputStories from "~stories/multiline-input/multiline-input.stories";

import { renderWithSalt } from "../render";

const {
  Default,
  Controlled,
  ControlledWithAdornment,
  Readonly,
  WithFormField,
} = composeStories(multilineInputStories);
const textbox = () => page.getByRole("textbox");

describe("GIVEN an MultilineInput", () => {
  it("SHOULD support data attribute on textAreaProps", async () => {
    await renderWithSalt(
      <Default
        textAreaProps={{ "data-testId": "customInput" }}
        value="value"
      />,
    );
    await expect.element(page.getByTestId("customInput")).toHaveValue("value");
  });

  it("should allow a default value to be set", async () => {
    const changeSpy = vi.fn();
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.persist();
      changeSpy(event);
    };
    await renderWithSalt(<Default onChange={handleChange} />);
    await expect.element(textbox()).toHaveValue("Value");
    await textbox().fill("New Value");
    expect(changeSpy).toHaveBeenCalled();
    expect(changeSpy.mock.lastCall?.[0].target.value).toBe("New Value");
    await expect.element(textbox()).toHaveValue("New Value");
  });

  it("should support a controlled value", async () => {
    const changeSpy = vi.fn();
    await renderWithSalt(<Controlled onChange={changeSpy} />);
    await expect.element(textbox()).toHaveValue("Value");
    await textbox().fill("New Value");
    expect(changeSpy).toHaveBeenCalled();
    expect(changeSpy.mock.lastCall?.[0].target.value).toBe("New Value");
    await expect.element(textbox()).toHaveValue("New Value");
  });

  it("should allow the value to be set as required", async () => {
    await renderWithSalt(<Default textAreaProps={{ required: true }} />);
    await expect.element(textbox()).toHaveAttribute("required");
  });

  it("should not receive focus when disabled", async () => {
    await renderWithSalt(
      <div>
        <button type="button">start</button>
        <Default disabled />
        <button type="button">end</button>
      </div>,
    );
    await expect.element(textbox()).toBeDisabled();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "start" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(textbox()).not.toHaveFocus();
    await expect
      .element(page.getByRole("button", { name: "end" }))
      .toHaveFocus();
  });

  it("should not allow the value to be changed when it is read-only", async () => {
    await renderWithSalt(<Readonly />);
    const input = page.getByRole("textbox").first();
    await expect.element(input).toHaveAttribute("readonly");
    await expect.element(input).toHaveValue("Value");
    await input.click();
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard("Update");
    await expect.element(input).toHaveValue("Value");
  });

  it("should have form field support", async () => {
    await renderWithSalt(<WithFormField />);
    const input = textbox();
    await expect.element(input).toHaveAccessibleName("Comments");
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        "Please leave feedback about your experience.",
      );
    await page.getByText("Comments").click();
    await expect.element(input).toHaveFocus();
  });

  it("should be disabled when it's FormField is disabled", async () => {
    await renderWithSalt(<WithFormField disabled />);
    await expect.element(textbox()).toBeDisabled();
  });

  it("should be required when it's FormField is required", async () => {
    await renderWithSalt(<WithFormField necessity="required" />);
    await expect
      .element(page.getByLabelText("Comments (Required)"))
      .toHaveAttribute("required");
  });

  it("should be required when it's FormField is required with an asterisk", async () => {
    await renderWithSalt(<WithFormField necessity="asterisk" />);
    await expect
      .element(page.getByLabelText("Comments *"))
      .toHaveAttribute("required");
  });

  it("should not be required when it's FormField is optional", async () => {
    await renderWithSalt(<WithFormField necessity="optional" />);
    await expect
      .element(page.getByLabelText("Comments (Optional)"))
      .not.toHaveAttribute("required");
  });

  it("should be read-only when it's FormField is read-only", async () => {
    await renderWithSalt(<WithFormField readOnly />);
    await expect
      .element(page.getByLabelText("Comments"))
      .toHaveAttribute("readonly");
  });

  it("should expand to fit its content", async () => {
    await renderWithSalt(<Default />);
    const input = textbox();
    const defaultHeight = (await input.element()).getBoundingClientRect()
      .height;
    await input.click();
    await userEvent.keyboard("{Enter}{Enter}{Enter}");
    await expect
      .poll(async () => (await input.element()).getBoundingClientRect().height)
      .toBeGreaterThan(defaultHeight);
  });

  it("should collapse back to fit content when content is reduced", async () => {
    await renderWithSalt(<Default rows={1} />);
    const input = textbox();
    const defaultHeight = (await input.element()).getBoundingClientRect()
      .height;
    await input.click();
    await userEvent.keyboard(
      "{Enter}{Enter}{Enter}{Backspace}{Backspace}{Backspace}",
    );
    await expect
      .poll(async () => (await input.element()).getBoundingClientRect().height)
      .toBe(defaultHeight);
  });

  it("should collapse back to fit content when value is reset", async () => {
    await renderWithSalt(<ControlledWithAdornment rows={1} />);
    const input = textbox();
    const defaultHeight = (await input.element()).getBoundingClientRect()
      .height;
    await input.click();
    await userEvent.keyboard("{Enter}{Enter}{Enter}");
    await page.getByRole("button").click();
    await expect
      .poll(async () => (await input.element()).getBoundingClientRect().height)
      .toBe(defaultHeight);
  });

  it("should not have empty aria-describedby or aria-labelledby attributes if used outside a formfield", async () => {
    await renderWithSalt(<Default />);
    await expect.element(textbox()).not.toHaveAttribute("aria-describedby");
    await expect.element(textbox()).not.toHaveAttribute("aria-labelledby");
  });

  it("SHOULD apply the name prop to the textarea", async () => {
    await renderWithSalt(<Default name="notes" />);
    await expect.element(textbox()).toHaveAttribute("name", "notes");
  });

  it("SHOULD allow textAreaProps.name to override the top-level name prop", async () => {
    await renderWithSalt(
      <Default name="notes" textAreaProps={{ name: "override" }} />,
    );
    await expect.element(textbox()).toHaveAttribute("name", "override");
  });
});
