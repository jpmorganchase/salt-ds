import { RadioButton } from "@salt-ds/core";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const tokens = {
  "--salt-selectable-borderColor": "rgb(31, 41, 51)",
  "--salt-selectable-foreground": "rgb(41, 51, 61)",
  "--salt-selectable-borderColor-hover": "rgb(71, 81, 91)",
  "--salt-selectable-foreground-hover": "rgb(81, 91, 101)",
  "--salt-selectable-borderColor-selected": "rgb(131, 61, 151)",
  "--salt-selectable-foreground-selected": "rgb(141, 71, 161)",
  "--salt-status-error-borderColor": "rgb(151, 61, 71)",
  "--salt-status-error-foreground-decorative": "rgb(161, 71, 81)",
  "--salt-status-warning-borderColor": "rgb(151, 111, 61)",
  "--salt-status-warning-foreground-decorative": "rgb(161, 121, 71)",
  "--salt-selectable-borderColor-readonly": "rgb(91, 101, 111)",
  "--salt-content-primary-foreground": "rgb(101, 111, 121)",
} as CSSProperties;

describe("Disabled RadioButton selection", () => {
  it.each([false, true])(
    "retains border and glyph colours on hover when checked=%s",
    async (checked) => {
      await renderWithSalt(
        <div style={tokens}>
          <RadioButton
            data-testid="radio-root"
            label="Option"
            checked={checked}
            disabled
          />
          <button type="button">Outside radio</button>
        </div>,
      );

      await userEvent.hover(
        page.getByRole("button", { name: "Outside radio" }),
      );
      const root = page.getByTestId("radio-root");
      const icon = root.element().querySelector(".saltRadioButtonIcon");
      if (!icon) {
        throw new Error("Expected RadioButton to render its icon");
      }
      const border = checked ? "rgb(131, 61, 151)" : "rgb(31, 41, 51)";
      const glyph = checked ? "rgb(141, 71, 161)" : "rgb(41, 51, 61)";
      expect(getComputedStyle(icon).borderTopColor).toBe(border);
      expect(getComputedStyle(icon).color).toBe(glyph);

      await userEvent.hover(root);
      expect(getComputedStyle(icon).borderTopColor).toBe(border);
      expect(getComputedStyle(icon).color).toBe(glyph);
      await expect.element(page.getByRole("radio")).toBeDisabled();
    },
  );

  it.each(["error", "warning"] as const)(
    "keeps %s validation styling on hover",
    async (validationStatus) => {
      await renderWithSalt(
        <div style={tokens}>
          <RadioButton
            label="Option"
            checked
            validationStatus={validationStatus}
          />
        </div>,
      );
      const root = page.getByText("Option");
      const icon = root.element().querySelector(".saltRadioButtonIcon");
      if (!icon) throw new Error("Expected RadioButton to render its icon");
      const border =
        validationStatus === "error" ? "rgb(151, 61, 71)" : "rgb(151, 111, 61)";
      const glyph =
        validationStatus === "error" ? "rgb(161, 71, 81)" : "rgb(161, 121, 71)";
      await userEvent.hover(root);
      expect(getComputedStyle(icon).borderTopColor).toBe(border);
      expect(getComputedStyle(icon).color).toBe(glyph);
    },
  );

  it("keeps read-only styling on hover", async () => {
    await renderWithSalt(
      <div style={tokens}>
        <RadioButton label="Option" checked readOnly />
      </div>,
    );
    const root = page.getByText("Option");
    const icon = root.element().querySelector(".saltRadioButtonIcon");
    if (!icon) throw new Error("Expected RadioButton to render its icon");
    await userEvent.hover(root);
    expect(getComputedStyle(icon).borderTopColor).toBe("rgb(91, 101, 111)");
    expect(getComputedStyle(icon).color).toBe("rgb(101, 111, 121)");
    expect(getComputedStyle(icon).borderTopStyle).toBe("dashed");
  });
});
