import { SearchInput } from "@salt-ds/lab";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

const textbox = () => page.getByRole("textbox");
const clearButton = () => page.getByRole("button", { name: "clear input" });

describe("GIVEN a SearchInput", () => {
  it("renders an empty uncontrolled input without a clear button", async () => {
    await renderWithSalt(<SearchInput />);
    await expect.element(textbox()).toHaveValue("");
    await expect.element(clearButton()).not.toBeInTheDocument();
  });

  it("has no a11y violations when empty", async () => {
    const { container } = await renderWithSalt(<SearchInput />);
    await runAxeScan(container);
  });

  it("renders a clear button for a default value", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await expect.element(clearButton()).toBeInTheDocument();
  });

  it("renders its default value", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await expect.element(textbox()).toHaveValue("default value");
  });

  it("submits its default value", async () => {
    const onSubmit = vi.fn();
    await renderWithSalt(
      <SearchInput defaultValue="default value" onSubmit={onSubmit} />,
    );
    textbox().element().focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("default value");
  });

  it("hides the clear button after clearing an uncontrolled value", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await clearButton().click();
    await expect.element(clearButton()).not.toBeInTheDocument();
  });

  it("calls onChange with an empty value when cleared", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <SearchInput defaultValue="default value" onChange={onChange} />,
    );
    await clearButton().click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), "");
  });

  it("clears an uncontrolled input value", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await clearButton().click();
    await expect.element(textbox()).toHaveValue("");
  });

  it("focuses an uncontrolled input after clearing", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await clearButton().click();
    await expect.element(textbox()).toHaveFocus();
  });

  it("calls onClear for an uncontrolled input", async () => {
    const onClear = vi.fn();
    await renderWithSalt(
      <SearchInput defaultValue="default value" onClear={onClear} />,
    );
    await clearButton().click();
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("does not submit immediately after clearing", async () => {
    const onSubmit = vi.fn();
    await renderWithSalt(
      <SearchInput defaultValue="default value" onSubmit={onSubmit} />,
    );
    await clearButton().click();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the clear button after entering a new value", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await clearButton().click();
    await userEvent.keyboard("new value");
    await expect.element(clearButton()).toBeInTheDocument();
  });

  it("updates the uncontrolled value after clearing", async () => {
    await renderWithSalt(<SearchInput defaultValue="default value" />);
    await clearButton().click();
    await userEvent.keyboard("new value");
    await expect.element(textbox()).toHaveValue("new value");
  });

  it("calls onChange with the new uncontrolled value", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <SearchInput defaultValue="default value" onChange={onChange} />,
    );
    await clearButton().click();
    await userEvent.keyboard("new value");
    expect(onChange).toHaveBeenCalledWith(expect.anything(), "new value");
  });

  it("retains clear behavior before entering and submitting a new value", async () => {
    const onClear = vi.fn();
    await renderWithSalt(
      <SearchInput defaultValue="default value" onClear={onClear} />,
    );
    await clearButton().click();
    await userEvent.keyboard("new value");
    await userEvent.keyboard("{Enter}");
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("renders a disabled input", async () => {
    await renderWithSalt(<SearchInput disabled />);
    await expect.element(textbox()).toBeDisabled();
  });

  it("has no a11y violations when disabled", async () => {
    const { container } = await renderWithSalt(<SearchInput disabled />);
    await runAxeScan(container);
  });

  it("renders an empty controlled input without a clear button", async () => {
    await renderWithSalt(<SearchInput value="" />);
    await expect.element(clearButton()).not.toBeInTheDocument();
    await expect.element(textbox()).toHaveValue("");
  });

  it("does not submit an empty controlled value", async () => {
    const onSubmit = vi.fn();
    await renderWithSalt(<SearchInput value="" onSubmit={onSubmit} />);
    await textbox().click();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders a clear button for a controlled value", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await expect.element(clearButton()).toBeInTheDocument();
  });

  it("renders the controlled value", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await expect.element(textbox()).toHaveValue("value a");
  });

  it("submits the controlled value", async () => {
    const onSubmit = vi.fn();
    await renderWithSalt(<SearchInput value="value a" onSubmit={onSubmit} />);
    await textbox().click();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("value a");
  });

  it("keeps a clear button while typing into a controlled input", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await textbox().click();
    await userEvent.keyboard("value b");
    await expect.element(clearButton()).toBeInTheDocument();
  });

  it("does not update a controlled value without a state update", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await textbox().click();
    await userEvent.keyboard("value b");
    await expect.element(textbox()).toHaveValue("value a");
  });

  it("calls onChange with the updated controlled value", async () => {
    const onChange = vi.fn();
    function ControlledSearchInput() {
      const [value, setValue] = useState("value a");
      return (
        <SearchInput
          onChange={(event, nextValue) => {
            setValue(nextValue);
            onChange(event, nextValue);
          }}
          value={value}
        />
      );
    }

    await renderWithSalt(<ControlledSearchInput />);
    await textbox().fill("value b");
    expect(onChange).toHaveBeenCalledWith(expect.anything(), "value b");
  });

  it("submits the prop value after attempted controlled edits", async () => {
    const onSubmit = vi.fn();
    await renderWithSalt(<SearchInput value="value a" onSubmit={onSubmit} />);
    await textbox().click();
    await userEvent.keyboard("value b");
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("value a");
  });

  it("keeps a clear button after controlled rerender", async () => {
    const { rerender } = await renderWithSalt(<SearchInput value="value a" />);
    await rerender(<SearchInput value="value b" />);
    await expect.element(textbox()).toHaveValue("value b");
    await expect.element(clearButton()).toBeInTheDocument();
  });

  it("updates the input after controlled rerender", async () => {
    const { rerender } = await renderWithSalt(<SearchInput value="value a" />);
    await rerender(<SearchInput value="value b" />);
    await expect.element(textbox()).toHaveValue("value b");
  });

  it("does not call onChange for controlled rerender", async () => {
    const onChange = vi.fn();
    const { rerender } = await renderWithSalt(
      <SearchInput value="value a" onChange={onChange} />,
    );
    await rerender(<SearchInput value="value b" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the clear button after clearing a controlled value", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await clearButton().click();
    await expect.element(clearButton()).toBeInTheDocument();
  });

  it("does not call onChange when clearing a controlled value", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<SearchInput value="value a" onChange={onChange} />);
    await clearButton().click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the prop value after clearing a controlled input", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await clearButton().click();
    await expect.element(textbox()).toHaveValue("value a");
  });

  it("refocuses a controlled input after clearing", async () => {
    await renderWithSalt(<SearchInput value="value a" />);
    await clearButton().click();
    await expect.element(textbox()).toHaveFocus();
  });

  it("calls onClear for a controlled input", async () => {
    const onClear = vi.fn();
    await renderWithSalt(<SearchInput value="value a" onClear={onClear} />);
    await clearButton().click();
    expect(onClear).toHaveBeenCalledOnce();
  });
});
