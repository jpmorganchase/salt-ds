import { InteractableCard, InteractableCardGroup } from "@salt-ds/core";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

// Distinct tokens ensure this test cannot pass because two theme values match.
const tokens = {
  "--salt-container-borderColor": "rgb(31, 41, 51)",
  "--salt-actionable-accented-borderColor-active": "rgb(131, 61, 151)",
} as CSSProperties;

const selectedBorder = "rgb(131, 61, 151)";

describe("Disabled InteractableCard selection", () => {
  describe.each([undefined, "none"] as const)(
    "borderColor=%s",
    (borderColor) => {
      it("preserves the selected border", async () => {
        await renderWithSalt(
          <div style={tokens}>
            <InteractableCard
              data-testid="selected-card"
              borderColor={borderColor}
              className="saltInteractableCard-selected"
              disabled
            >
              Selected
            </InteractableCard>
            <InteractableCard
              data-testid="unselected-card"
              borderColor={borderColor}
              disabled
            >
              Unselected
            </InteractableCard>
            <button type="button">Outside cards</button>
          </div>,
        );

        await userEvent.hover(
          page.getByRole("button", { name: "Outside cards" }),
        );
        const selected = page.getByTestId("selected-card");
        const unselected = page.getByTestId("unselected-card");
        const unselectedBorder =
          borderColor === "none" ? "rgba(0, 0, 0, 0)" : "rgb(31, 41, 51)";

        expect(getComputedStyle(selected.element()).borderTopColor).toBe(
          selectedBorder,
        );
        expect(getComputedStyle(unselected.element()).borderTopColor).toBe(
          unselectedBorder,
        );
        await userEvent.hover(selected);
        expect(getComputedStyle(selected.element()).borderTopColor).toBe(
          selectedBorder,
        );
        expect(getComputedStyle(selected.element()).boxShadow).toBe("none");
        await userEvent.hover(unselected);
        expect(getComputedStyle(unselected.element()).borderTopColor).toBe(
          unselectedBorder,
        );
        expect(getComputedStyle(unselected.element()).boxShadow).toBe("none");
      });

      it("preserves selection inherited from a disabled group", async () => {
        await renderWithSalt(
          <div style={tokens}>
            <InteractableCardGroup
              aria-label="Cards"
              defaultValue="selected"
              disabled
            >
              <InteractableCard value="selected" borderColor={borderColor}>
                Selected
              </InteractableCard>
              <InteractableCard value="other" borderColor={borderColor}>
                Other
              </InteractableCard>
            </InteractableCardGroup>
            <button type="button">Outside cards</button>
          </div>,
        );

        await userEvent.hover(
          page.getByRole("button", { name: "Outside cards" }),
        );
        const selected = page.getByRole("radio", {
          name: "Selected",
          exact: true,
        });
        await expect.element(selected).toHaveAttribute("aria-checked", "true");
        await expect.element(selected).toHaveAttribute("aria-disabled", "true");
        expect(getComputedStyle(selected.element()).borderTopColor).toBe(
          selectedBorder,
        );
        await userEvent.hover(selected);
        expect(getComputedStyle(selected.element()).borderTopColor).toBe(
          selectedBorder,
        );
        expect(getComputedStyle(selected.element()).boxShadow).toBe("none");
      });
    },
  );
});
