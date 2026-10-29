import { FormLabel } from "@salt-ds/lab";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const labelText = "label text";

describe("GIVEN a FormLabel", () => {
  it("renders its label", async () => {
    await renderWithSalt(<FormLabel label={labelText} />);
    await expect.element(page.getByText(labelText)).toBeInTheDocument();
  });

  it.each([
    [true, "required", "Required", true],
    [true, undefined, "Required", false],
    [true, "optional", "Required", false],
    [false, "optional", "Optional", true],
    [false, undefined, "Optional", false],
    [false, "required", "Optional", false],
  ] as const)(
    "renders necessity text for required=%s and displayedNecessity=%s",
    async (required, displayedNecessity, necessity, visible) => {
      await renderWithSalt(
        <FormLabel
          label={labelText}
          required={required}
          displayedNecessity={displayedNecessity}
        />,
      );
      const assertion = expect.element(page.getByText(`(${necessity})`));
      if (visible) await assertion.toBeInTheDocument();
      else await assertion.not.toBeInTheDocument();
    },
  );

  it.each([
    [undefined, "InfoSolidIcon"],
    ["warning", "WarningSolidIcon"],
    ["error", "ErrorSolidIcon"],
  ] as const)(
    "renders the %s status indicator",
    async (validationStatus, testId) => {
      await renderWithSalt(
        <FormLabel
          label={labelText}
          hasStatusIndicator
          validationStatus={validationStatus}
        />,
      );
      await expect.element(page.getByTestId(testId)).toBeInTheDocument();
    },
  );
});
