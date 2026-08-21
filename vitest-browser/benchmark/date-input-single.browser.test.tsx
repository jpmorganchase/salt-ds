import { FormField, FormFieldLabel } from "@salt-ds/core";
import {
  DateDetailError,
  type DateFrameworkType,
  type ParserResult,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { DateInputSingle } from "@salt-ds/date-components";
import { es as dateFnsEs } from "date-fns/locale";
import MockDate from "mockdate";
import { type ChangeEvent, type SyntheticEvent, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as dateInputStories from "~stories/date-input/date-input.stories";
import "moment/dist/locale/es";
import "dayjs/locale/es";
import { renderWithSalt } from "../render";

const {
  // Storybook wraps components in its own LocalizationProvider, so do not
  // compose this story.
  SingleWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: Storybook story type
} = dateInputStories as any;

const adapterMoment = new AdapterMoment();
adapterMoment.moment.updateLocale("es", {
  monthsShort: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
});

function assertDateChange(
  spy: ReturnType<typeof vi.fn>,
  expectedValue: string,
  expectedDate: DateFrameworkType | null | undefined,
  adapter: SaltDateAdapter,
) {
  const lastCallArgs = spy.mock.calls.at(-1);
  if (!lastCallArgs) {
    throw new Error("Expected the date change callback to have been called");
  }
  const date = lastCallArgs[1];
  const details = lastCallArgs[2];
  const expectedValidDate = adapter.isValid(expectedDate);

  if (expectedValidDate) {
    expect(adapter.format(date, "DD MMM YYYY")).toBe(
      adapter.format(expectedDate, "DD MMM YYYY"),
    );
  } else if (expectedValidDate === undefined) {
    expect(adapter.isValid(date)).toBe(false);
    expect(details).toEqual({
      errors: [{ type: DateDetailError.UNSET, message: "no date defined" }],
      value: expectedValue,
    });
  } else if (expectedValidDate === null) {
    expect(adapter.isValid(date)).toBe(false);
    expect(details).toEqual({
      errors: [{ type: DateDetailError.UNSET, message: "not a valid date" }],
      value: expectedValue,
    });
  }
}

async function replaceInput(value: string) {
  const input = page.getByRole("textbox");
  await input.click();
  await input.fill(value);
  return input;
}

// biome-ignore lint/suspicious/noExplicitAny: shared behavioral contract across adapter date types
function registerAdapterTests(adapter: SaltDateAdapter<any>) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => {
      MockDate.set(new Date(2024, 4, 6));
    });

    afterEach(() => {
      MockDate.reset();
    });

    const render = (children: React.ReactNode, locale?: unknown) =>
      renderWithSalt(children, { dateAdapter: adapter, dateLocale: locale });

    it("SHOULD apply the name prop to the input", async () => {
      await render(<DateInputSingle name="start-date" />);
      await expect
        .element(page.getByRole("textbox"))
        .toHaveAttribute("name", "start-date");
    });

    it("SHOULD allow inputProps.name to override the top-level name prop", async () => {
      await render(
        <DateInputSingle name="start-date" inputProps={{ name: "override" }} />,
      );
      await expect
        .element(page.getByRole("textbox"))
        .toHaveAttribute("name", "override");
    });

    const initialDateValue = "05 Jan 2025";
    const initialDate = adapter.parse(initialDateValue, "DD MMM YYYY").date;
    const updatedDateValue =
      adapter.lib !== "dayjs" ? "01 nov 2027" : "01 Nov 2027";
    const updatedFormattedDateValue = "01 Nov 2027";
    const updatedDate = adapter.parse(
      updatedFormattedDateValue,
      "DD MMM YYYY",
    ).date;

    it("SHOULD render value, even when not a valid date", async () => {
      await render(
        <DateInputSingle defaultValue="date value" validationStatus="error" />,
      );
      const input = page.getByRole("textbox");
      await expect.element(input).toHaveValue("date value");
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
    });

    it("SHOULD show the empty marker when read-only with an empty default value", async () => {
      await render(<DateInputSingle defaultValue="" readOnly />);
      await expect.element(page.getByRole("textbox")).toHaveValue("—");
    });

    it("SHOULD show the empty marker when read-only with a controlled empty value", async () => {
      await render(<DateInputSingle value="" readOnly />);
      await expect.element(page.getByRole("textbox")).toHaveValue("—");
    });

    it("SHOULD use top-level aria-label", async () => {
      await render(<DateInputSingle aria-label="trade date" />);
      const input = page.getByRole("textbox", { name: "trade date" });
      await expect.element(input).toHaveAttribute("aria-label", "trade date");
      await expect.element(input).not.toHaveAttribute("aria-labelledby");
    });

    it("SHOULD use inputProps aria-label override", async () => {
      await render(
        <DateInputSingle inputProps={{ "aria-label": "Settlement date" }} />,
      );
      const input = page.getByRole("textbox", { name: "Settlement date" });
      await expect
        .element(input)
        .toHaveAttribute("aria-label", "Settlement date");
      await expect.element(input).not.toHaveAttribute("aria-labelledby");
    });

    it("SHOULD call onDateChange only if value changes", async () => {
      const onDateChange = vi.fn();
      const onDateValueChange = vi.fn();
      await render(
        <DateInputSingle
          onDateChange={onDateChange}
          onDateValueChange={onDateValueChange}
        />,
      );

      await replaceInput("bad date");
      await userEvent.tab();
      expect(onDateChange).toHaveBeenCalledTimes(1);
      expect(onDateValueChange).toHaveBeenCalledWith(
        expect.anything(),
        "bad date",
      );
      assertDateChange(onDateChange, "bad date", null, adapter);

      await replaceInput("bad date");
      await userEvent.tab();
      expect(onDateChange).toHaveBeenCalledTimes(1);

      await replaceInput("another bad date");
      await userEvent.tab();
      expect(onDateChange).toHaveBeenCalledTimes(2);
      assertDateChange(onDateChange, "another bad date", null, adapter);
      expect(onDateValueChange).toHaveBeenCalledWith(
        expect.anything(),
        "another bad date",
      );

      await replaceInput("");
      await userEvent.tab();
      expect(onDateChange).toHaveBeenCalledTimes(3);
      assertDateChange(onDateChange, "", undefined, adapter);
      expect(onDateValueChange).toHaveBeenCalledWith(expect.anything(), "");

      await replaceInput(initialDateValue);
      await userEvent.tab();
      expect(onDateChange).toHaveBeenCalledTimes(4);
      assertDateChange(onDateChange, initialDateValue, initialDate, adapter);

      await replaceInput(initialDateValue);
      await userEvent.tab();
      expect(onDateChange).toHaveBeenCalledTimes(4);

      const input = page.getByRole("textbox");
      await input.click();
      await userEvent.tab();
      await expect.element(input).toHaveValue(initialDateValue);
      expect(onDateChange).toHaveBeenCalledTimes(4);
    });

    it("SHOULD support custom formatter", async () => {
      const onDateChange = vi.fn();
      await render(
        <DateInputSingle format="DD/MM/YYYY" onDateChange={onDateChange} />,
      );
      await replaceInput("01/02/2024");
      await userEvent.tab();
      assertDateChange(
        onDateChange,
        "01/02/2024",
        adapter.parse("01/02/2024", "DD/MM/YYYY").date,
        adapter,
      );
      await expect.element(page.getByRole("textbox")).toHaveValue("01/02/2024");
    });

    it("SHOULD support custom parser", async () => {
      const onDateChange = vi.fn();
      const customParser = vi.fn((inputDate: string): ParserResult => {
        expect(inputDate).toBe("custom value");
        return { date: initialDate, value: initialDateValue };
      });
      await render(
        <DateInputSingle
          format="DD MMM YYYY"
          onDateChange={onDateChange}
          parse={customParser}
        />,
      );
      await replaceInput("custom value");
      await userEvent.tab();
      expect(customParser).toHaveBeenCalledTimes(1);
      assertDateChange(onDateChange, initialDateValue, initialDate, adapter);
      await expect
        .element(page.getByRole("textbox"))
        .toHaveValue(initialDateValue);
    });

    describe("locale", () => {
      it("SHOULD render date in the current locale", async () => {
        await render(
          <DateInputSingle
            defaultDate={adapter.parse("01 Aug 2030", "DD MMM YYYY").date}
          />,
          adapter.lib === "date-fns" ? dateFnsEs : "es-ES",
        );
        await expect
          .element(page.getByRole("textbox"))
          .toHaveValue("01 ago 2030");
      });
    });

    describe("timezone", () => {
      const timezones = [
        { timezone: "default", expectedResult: "2025-01-05T00:00:00.000Z" },
        { timezone: "system", expectedResult: "2025-01-05T00:00:00.000Z" },
        { timezone: "UTC", expectedResult: "2025-01-05T00:00:00.000Z" },
        {
          timezone: "America/New_York",
          expectedResult: "2025-01-05T05:00:00.000Z",
        },
        {
          timezone: "Europe/London",
          expectedResult: "2025-01-05T00:00:00.000Z",
        },
        {
          timezone: "Asia/Shanghai",
          expectedResult: "2025-01-04T16:00:00.000Z",
        },
        {
          timezone: "Asia/Kolkata",
          expectedResult: "2025-01-04T18:30:00.000Z",
        },
      ];

      for (const { timezone, expectedResult } of timezones) {
        it(`SHOULD render date in the ${timezone} timezone`, async () => {
          await render(<SingleWithTimezone />);
          const timezoneDropdown = document.querySelector<HTMLButtonElement>(
            'button[aria-label="timezone dropdown"]',
          );
          if (!timezoneDropdown) {
            throw new Error("Timezone dropdown was not rendered");
          }
          await page.elementLocator(timezoneDropdown).click();
          const option = page.getByRole("option", { name: timezone });
          await option.hover();
          await option.click();
          await replaceInput(initialDateValue);
          await userEvent.tab();
          await expect
            .element(page.getByTestId("iso-date-label"))
            .toHaveTextContent(expectedResult);
        });
      }
    });

    describe("uncontrolled component", () => {
      it("SHOULD update when changed with a valid date", async () => {
        const inputChange = vi.fn();
        const dateChange = vi.fn();
        const dateValueChange = vi.fn();
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          inputChange(event);
        };
        await render(
          <DateInputSingle
            defaultDate={initialDate}
            onChange={handleChange}
            onDateValueChange={dateValueChange}
            onDateChange={dateChange}
          />,
        );
        await replaceInput(updatedDateValue);
        expect(dateValueChange).toHaveBeenCalledWith(
          expect.anything(),
          updatedDateValue,
        );
        expect(dateChange).not.toHaveBeenCalled();
        expect(inputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue,
        );
        await userEvent.tab();
        expect(dateValueChange).toHaveBeenCalledWith(
          expect.anything(),
          updatedFormattedDateValue,
        );
        assertDateChange(dateChange, updatedDateValue, updatedDate, adapter);
        await expect
          .element(page.getByRole("textbox"))
          .toHaveValue(updatedFormattedDateValue);
      });
    });

    describe("controlled component", () => {
      let inputChange: ReturnType<
        typeof vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>
      >;
      let dateChange: ReturnType<
        typeof vi.fn<
          (
            event: SyntheticEvent,
            newDate: DateFrameworkType | null | undefined,
          ) => void
        >
      >;
      let dateValueChange: ReturnType<
        typeof vi.fn<(event: SyntheticEvent | null, newValue: string) => void>
      >;

      function ControlledDateInput() {
        const [date, setDate] = useState<DateFrameworkType | null>(initialDate);
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          inputChange(event);
        };
        const handleDateChange = (
          event: SyntheticEvent,
          newDate: DateFrameworkType | null | undefined,
        ) => {
          event.persist();
          setDate(newDate ?? null);
          dateChange(event, newDate);
        };
        return (
          <DateInputSingle
            date={date}
            onChange={handleChange}
            onDateValueChange={dateValueChange}
            onDateChange={handleDateChange}
          />
        );
      }

      beforeEach(async () => {
        inputChange = vi.fn();
        dateChange = vi.fn();
        dateValueChange = vi.fn();
        await render(<ControlledDateInput />);
      });

      it("SHOULD update when changed with a valid date", async () => {
        await replaceInput(updatedDateValue);
        expect(dateValueChange).toHaveBeenCalledWith(
          expect.anything(),
          updatedDateValue,
        );
        expect(dateChange).not.toHaveBeenCalled();
        expect(inputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue,
        );
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(1);
        assertDateChange(dateChange, updatedDateValue, updatedDate, adapter);
        const input = page.getByRole("textbox");
        await expect.element(input).toHaveValue(updatedFormattedDateValue);
        await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      });

      it("SHOULD be able to clear date and update", async () => {
        await replaceInput("");
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(1);
        assertDateChange(dateChange, "", null, adapter);
        await expect.element(page.getByRole("textbox")).toHaveValue("");

        await replaceInput(updatedDateValue);
        expect(dateValueChange).toHaveBeenCalledWith(
          expect.anything(),
          updatedDateValue,
        );
        expect(inputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue,
        );
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(2);
        assertDateChange(dateChange, updatedDateValue, updatedDate, adapter);
        await expect
          .element(page.getByRole("textbox"))
          .toHaveValue(updatedFormattedDateValue);
      });

      it("SHOULD have an accessible name via aria-labelledby when wrapped in a FormField", async () => {
        await render(
          <FormField>
            <FormFieldLabel>Date</FormFieldLabel>
            <DateInputSingle defaultValue="05 Jan 2025" />
          </FormField>,
        );
        const input = page.getByRole("textbox");
        const labelledBy = input.element().getAttribute("aria-labelledby");
        const label = input.element().getAttribute("aria-label");
        expect(labelledBy).toBeTruthy();
        expect(label).toBeTruthy();
      });
    });
  });
}

describe("GIVEN a DateInputSingle", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(adapterMoment);
});
