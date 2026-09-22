import { FormField, type FormFieldProps } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { DateInputRange, DateInputSingle } from "@salt-ds/date-components";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as dateInputStories from "~stories/date-input/date-input.stories";

const composedStories = composeStories(dateInputStories);
function registerAdapterTests<TDate extends DateFrameworkType, TLocale>(
  adapter: SaltDateAdapter<TDate, TLocale>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    checkAccessibility(composedStories, (children) =>
      renderWithSalt(children, { dateAdapter: adapter }),
    );
  });
}

describe("GIVEN a DateInput", () => {
  it("exposes resolved errors on read-only date fields and preserves each native override", async () => {
    const fields = (
      status?: FormFieldProps["validationStatus"],
      override = false,
    ) => (
      <FormField validationStatus={status} readOnly>
        <DateInputSingle
          aria-label="Trade date"
          validationStatus="error"
          inputProps={override ? { "aria-invalid": false } : undefined}
        />
        <DateInputRange
          validationStatus="error"
          startInputProps={{
            "aria-label": "Start date",
            ...(override && { "aria-invalid": false }),
          }}
          endInputProps={{
            "aria-label": "End date",
            ...(override && { "aria-invalid": "grammar" as const }),
          }}
        />
      </FormField>
    );
    const { rerender } = await renderWithSalt(fields("error"), {
      dateAdapter: new AdapterDateFns(),
    });
    const single = page.getByRole("textbox", { name: "Trade date" });
    const start = page.getByRole("textbox", { name: "Start date" });
    const end = page.getByRole("textbox", { name: "End date" });
    for (const control of [single, start, end]) {
      await expect.element(control).toHaveAttribute("readonly");
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
    }
    for (const status of ["warning", "success"] as const) {
      await rerender(fields(status));
      for (const control of [single, start, end]) {
        await expect.element(control).not.toHaveAttribute("aria-invalid");
      }
    }
    await rerender(fields());
    for (const control of [single, start, end]) {
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
    }
    await rerender(fields("error", true));
    await expect.element(single).toHaveAttribute("aria-invalid", "false");
    await expect.element(start).toHaveAttribute("aria-invalid", "false");
    await expect.element(end).toHaveAttribute("aria-invalid", "grammar");
  });

  registerAdapterTests(new AdapterDateFns());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
