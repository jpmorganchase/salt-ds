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
import {
  DateInputRange,
  type DateInputRangeDetails,
  type DateInputRangeValue,
  type DateParserField,
  type DateRangeSelection,
} from "@salt-ds/date-components";
import { es as dateFnsEs } from "date-fns/locale";
import MockDate from "mockdate";
import {
  type ChangeEvent,
  type ReactNode,
  type SyntheticEvent,
  useState,
} from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as dateInputStories from "~stories/date-input/date-input.stories";
import "moment/dist/locale/es";
import "dayjs/locale/es";
import { renderWithSalt } from "../render";

const {
  // Storybook wraps this component in its own LocalizationProvider.
  RangeWithTimezone,
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
  expectedValue: { startDate?: string; endDate?: string },
  expectedDate: {
    startDate: DateFrameworkType | null | undefined;
    endDate: DateFrameworkType | null | undefined;
  },
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  const lastCallArgs = spy.mock.calls.at(-1);
  if (!lastCallArgs) {
    throw new Error("Expected the date change callback to have been called");
  }
  const date = lastCallArgs[1] as DateRangeSelection;
  const details = lastCallArgs[2] as DateInputRangeDetails;

  if (adapter.isValid(expectedDate.startDate)) {
    expect(date.startDate).toBeDefined();
    expect(adapter.format(date.startDate, "DD MMM YYYY")).toBe(
      adapter.format(expectedDate.startDate, "DD MMM YYYY"),
    );
  } else if (expectedDate.startDate === undefined) {
    expect(adapter.isValid(date.startDate)).toBe(false);
    const startDetails = details.startDate;
    if (!startDetails) throw new Error("Expected start date details");
    expect(startDetails.errors).toEqual([
      { type: DateDetailError.UNSET, message: "no date defined" },
    ]);
    expect(startDetails.value).toBe(expectedValue.startDate);
  } else if (expectedDate.startDate === null) {
    expect(adapter.isValid(date.startDate)).toBe(false);
    const startDetails = details.startDate;
    if (!startDetails) throw new Error("Expected start date details");
    expect(startDetails.errors).toEqual([
      { type: DateDetailError.INVALID_DATE, message: "not a valid date" },
    ]);
    expect(startDetails.value).toBe(expectedValue.startDate);
  }

  if (adapter.isValid(expectedDate.endDate)) {
    expect(date.endDate).toBeDefined();
    expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe(
      adapter.format(expectedDate.endDate, "DD MMM YYYY"),
    );
  } else if (expectedDate.endDate === undefined) {
    expect(adapter.isValid(date.endDate)).toBe(false);
    const endDetails = details.endDate;
    if (!endDetails) throw new Error("Expected end date details");
    expect(endDetails.errors).toEqual([
      { type: DateDetailError.UNSET, message: "no date defined" },
    ]);
    expect(endDetails.value).toBe(expectedValue.endDate);
  } else if (expectedDate.endDate === null) {
    expect(adapter.isValid(date.endDate)).toBe(false);
    const endDetails = details.endDate;
    if (!endDetails) throw new Error("Expected end date details");
    expect(endDetails.errors).toEqual([
      { type: DateDetailError.INVALID_DATE, message: "not a valid date" },
    ]);
    expect(endDetails.value).toBe(expectedValue.endDate);
  }
}

function dateInput(label: "Start date" | "End date") {
  const element = document.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  );
  if (!element) throw new Error(`${label} input was not rendered`);
  return page.elementLocator(element);
}

async function replaceDateInput(
  label: "Start date" | "End date",
  value: string,
) {
  const input = dateInput(label);
  await input.click();
  await input.fill(value);
  return input;
}

function registerAdapterTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(new Date(2024, 4, 6)));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode, locale?: unknown) =>
      renderWithSalt(children, { dateAdapter: adapter, dateLocale: locale });

    const initialDate = {
      startDate: adapter.parse("05 Jan 2025", "DD MMM YYYY").date,
      endDate: adapter.parse("06 Feb 2026", "DD MMM YYYY").date,
    };
    const initialDateValue = {
      startDate: "05 Jan 2025",
      endDate: "06 Feb 2026",
    };
    const updatedDateValue = {
      startDate: "01 Nov 2027",
      endDate: "02 Dec 2028",
    };
    const updatedFormattedDateValue = { ...updatedDateValue };
    const updatedDate = {
      startDate: adapter.parse("01 Nov 2027", "DD MMM YYYY").date,
      endDate: adapter.parse("02 Dec 2028", "DD MMM YYYY").date,
    };

    it("SHOULD apply startName and endName to the respective inputs", async () => {
      await render(
        <DateInputRange startName="trip-start" endName="trip-end" />,
      );
      await expect
        .element(dateInput("Start date"))
        .toHaveAttribute("name", "trip-start");
      await expect
        .element(dateInput("End date"))
        .toHaveAttribute("name", "trip-end");
    });

    it("SHOULD allow startInputProps.name and endInputProps.name to override", async () => {
      await render(
        <DateInputRange
          startName="trip-start"
          endName="trip-end"
          startInputProps={{ name: "start-override" }}
          endInputProps={{ name: "end-override" }}
        />,
      );
      await expect
        .element(dateInput("Start date"))
        .toHaveAttribute("name", "start-override");
      await expect
        .element(dateInput("End date"))
        .toHaveAttribute("name", "end-override");
    });

    for (const controlled of [false, true]) {
      it(`SHOULD show the empty marker when read-only with a ${controlled ? "controlled" : "default"} empty value`, async () => {
        await render(
          <DateInputRange
            {...(controlled
              ? { value: { startDate: "", endDate: "" } }
              : { defaultValue: { startDate: "", endDate: "" } })}
            readOnly
          />,
        );
        const inputs = await page.getByRole("textbox").elements();
        expect(inputs).toHaveLength(2);
        for (const input of inputs) expect(input).toHaveValue("—");
      });
    }

    it("SHOULD have accessible names when wrapped in a FormField", async () => {
      await render(
        <FormField>
          <FormFieldLabel>Date range</FormFieldLabel>
          <DateInputRange />
        </FormField>,
      );
      for (const input of await page.getByRole("textbox").elements()) {
        expect(input.getAttribute("aria-labelledby")).toBeTruthy();
        expect(input.getAttribute("aria-label")).toBeTruthy();
      }
    });

    it("SHOULD use top-level aria-label for both inputs", async () => {
      await render(<DateInputRange aria-label="trade and settlement dates" />);
      for (const [name, label] of [
        ["Start date trade and settlement dates", "Start date"],
        ["End date trade and settlement dates", "End date"],
      ] as const) {
        const input = page.getByRole("textbox", { name });
        await expect.element(input).toHaveAttribute("aria-label", name);
        await expect.element(input).not.toHaveAttribute("aria-labelledby");
        expect(input.element().getAttribute("aria-label")).toContain(label);
      }
    });

    it("SHOULD use per-input aria-label overrides for both inputs", async () => {
      await render(
        <DateInputRange
          startInputProps={{ "aria-label": "Trade date" }}
          endInputProps={{ "aria-label": "Settlement date" }}
        />,
      );
      for (const name of ["Trade date", "Settlement date"]) {
        const input = page.getByRole("textbox", { name });
        await expect.element(input).toHaveAttribute("aria-label", name);
        await expect.element(input).not.toHaveAttribute("aria-labelledby");
      }
    });

    it("SHOULD render value, even when not a valid date", async () => {
      await render(
        <DateInputRange
          defaultValue={{
            startDate: "start date value",
            endDate: "end date value",
          }}
          validationStatus="error"
        />,
      );
      await expect
        .element(dateInput("Start date"))
        .toHaveValue("start date value");
      await expect.element(dateInput("End date")).toHaveValue("end date value");
      await expect
        .element(dateInput("Start date"))
        .toHaveAttribute("aria-invalid", "true");
      await expect
        .element(dateInput("End date"))
        .toHaveAttribute("aria-invalid", "true");
    });

    it("SHOULD call onDateChange only if value changes", async () => {
      const onDateChange = vi.fn();
      await render(<DateInputRange onDateChange={onDateChange} />);

      const cases: Array<{
        field: "Start date" | "End date";
        value: string;
        expectedValue: { startDate: string; endDate: string };
        expectedDate: {
          startDate: DateFrameworkType | null | undefined;
          endDate: DateFrameworkType | null | undefined;
        };
      }> = [
        {
          field: "Start date",
          value: "bad start date",
          expectedValue: { startDate: "bad start date", endDate: "" },
          expectedDate: { startDate: null, endDate: undefined },
        },
        {
          field: "Start date",
          value: "another bad start date",
          expectedValue: { startDate: "another bad start date", endDate: "" },
          expectedDate: { startDate: null, endDate: undefined },
        },
        {
          field: "End date",
          value: "another bad end date",
          expectedValue: {
            startDate: "another bad start date",
            endDate: "another bad end date",
          },
          expectedDate: { startDate: null, endDate: null },
        },
        {
          field: "Start date",
          value: "",
          expectedValue: { startDate: "", endDate: "another bad end date" },
          expectedDate: { startDate: undefined, endDate: null },
        },
        {
          field: "End date",
          value: "",
          expectedValue: { startDate: "", endDate: "" },
          expectedDate: { startDate: undefined, endDate: undefined },
        },
        {
          field: "Start date",
          value: initialDateValue.startDate,
          expectedValue: { startDate: initialDateValue.startDate, endDate: "" },
          expectedDate: {
            startDate: initialDate.startDate,
            endDate: undefined,
          },
        },
        {
          field: "End date",
          value: initialDateValue.endDate,
          expectedValue: initialDateValue,
          expectedDate: initialDate,
        },
      ];

      for (const [index, testCase] of cases.entries()) {
        await replaceDateInput(testCase.field, testCase.value);
        await userEvent.tab();
        expect(onDateChange).toHaveBeenCalledTimes(index + 1);
        assertDateChange(
          onDateChange,
          testCase.expectedValue,
          testCase.expectedDate,
          adapter,
        );
      }

      await dateInput("Start date").click();
      await userEvent.tab();
      await expect
        .element(dateInput("Start date"))
        .toHaveValue(initialDateValue.startDate);
      await expect.element(dateInput("End date")).toHaveFocus();
      await userEvent.tab();
      await expect
        .element(dateInput("End date"))
        .toHaveValue(initialDateValue.endDate);
      expect(onDateChange).toHaveBeenCalledTimes(7);
    });

    it("SHOULD support custom formatter", async () => {
      const onDateChange = vi.fn();
      await render(
        <DateInputRange format="DD/MM/YYYY" onDateChange={onDateChange} />,
      );
      await replaceDateInput("Start date", "31/01/2024");
      await userEvent.tab();
      assertDateChange(
        onDateChange,
        { startDate: "31/01/2024", endDate: "" },
        {
          startDate: adapter.parse("31/01/2024", "DD/MM/YYYY").date,
          endDate: undefined,
        },
        adapter,
      );
      await replaceDateInput("End date", "31/12/2024");
      await userEvent.tab();
      assertDateChange(
        onDateChange,
        { startDate: "31/01/2024", endDate: "31/12/2024" },
        {
          startDate: adapter.parse("31/01/2024", "DD/MM/YYYY").date,
          endDate: adapter.parse("31/12/2024", "DD/MM/YYYY").date,
        },
        adapter,
      );
    });

    it("SHOULD support custom parser", async () => {
      const onDateChange = vi.fn();
      const customParser = vi.fn(
        (inputDate: string, _field: DateParserField): ParserResult => {
          if (inputDate === "custom start date") {
            return { date: initialDate.startDate, value: inputDate };
          }
          if (inputDate === "custom end date") {
            return { date: initialDate.endDate, value: inputDate };
          }
          if (inputDate === "") {
            return {
              date: adapter.parse("invalid date", "DD MMM YYYY").date,
              value: "",
              errors: [
                { type: DateDetailError.UNSET, message: "no date defined" },
              ],
            };
          }
          return {
            date: adapter.parse(inputDate, "DD MMM YYYY").date,
            value: inputDate,
          };
        },
      );
      await render(
        <DateInputRange
          format="DD MMM YYYY"
          onDateChange={onDateChange}
          parse={customParser}
        />,
      );
      await replaceDateInput("Start date", "custom start date");
      await userEvent.tab();
      assertDateChange(
        onDateChange,
        { startDate: "custom start date", endDate: "" },
        { startDate: initialDate.startDate, endDate: undefined },
        adapter,
      );
      await replaceDateInput("End date", "custom end date");
      await userEvent.tab();
      assertDateChange(
        onDateChange,
        { startDate: "custom start date", endDate: "custom end date" },
        initialDate,
        adapter,
      );
      await expect
        .element(dateInput("Start date"))
        .toHaveValue(initialDateValue.startDate);
      await expect
        .element(dateInput("End date"))
        .toHaveValue(initialDateValue.endDate);
    });

    describe("locale", () => {
      it("SHOULD render dates in the current locale", async () => {
        await render(
          <DateInputRange
            defaultDate={{
              startDate: adapter.parse("01 Aug 2030", "DD MMM YYYY").date,
              endDate: adapter.parse("01 Dec 2030", "DD MMM YYYY").date,
            }}
          />,
          adapter.lib === "date-fns" ? dateFnsEs : "es-ES",
        );
        await expect
          .element(dateInput("Start date"))
          .toHaveValue("01 ago 2030");
        await expect.element(dateInput("End date")).toHaveValue("01 dic 2030");
      });
    });

    describe("timezone", () => {
      const localMidnightStartIso = new Date(2025, 0, 5).toISOString();
      const localMidnightEndIso = new Date(2026, 1, 6).toISOString();
      const cases = [
        {
          timezone: "default",
          startDate: localMidnightStartIso,
          endDate: localMidnightEndIso,
        },
        {
          timezone: "system",
          startDate: localMidnightStartIso,
          endDate: localMidnightEndIso,
        },
        {
          timezone: "UTC",
          startDate: "2025-01-05T00:00:00.000Z",
          endDate: "2026-02-06T00:00:00.000Z",
        },
        {
          timezone: "America/New_York",
          startDate: "2025-01-05T05:00:00.000Z",
          endDate: "2026-02-06T05:00:00.000Z",
        },
        {
          timezone: "Europe/London",
          startDate: "2025-01-05T00:00:00.000Z",
          endDate: "2026-02-06T00:00:00.000Z",
        },
        {
          timezone: "Asia/Shanghai",
          startDate: "2025-01-04T16:00:00.000Z",
          endDate: "2026-02-05T16:00:00.000Z",
        },
        {
          timezone: "Asia/Kolkata",
          startDate: "2025-01-04T18:30:00.000Z",
          endDate: "2026-02-05T18:30:00.000Z",
        },
      ];

      for (const { timezone, startDate, endDate } of cases) {
        it(`SHOULD render date in the ${timezone} timezone`, async () => {
          await render(<RangeWithTimezone />);
          const dropdown = document.querySelector<HTMLButtonElement>(
            'button[aria-label="timezone dropdown"]',
          );
          if (!dropdown) throw new Error("Timezone dropdown was not rendered");
          await page.elementLocator(dropdown).click();
          const option = page.getByRole("option", { name: timezone });
          await option.hover();
          await option.click();
          await replaceDateInput("Start date", initialDateValue.startDate);
          await userEvent.tab();
          await replaceDateInput("End date", initialDateValue.endDate);
          await userEvent.tab();
          await expect
            .element(page.getByTestId("iso-start-date-label"))
            .toHaveTextContent(startDate);
          await expect
            .element(page.getByTestId("iso-end-date-label"))
            .toHaveTextContent(endDate);
        });
      }
    });

    describe("uncontrolled component", () => {
      it("SHOULD update when changed with a valid date", async () => {
        const startInputChange = vi.fn();
        const endInputChange = vi.fn();
        const dateChange = vi.fn();
        const dateValueChange = vi.fn();
        const persistStart = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          startInputChange(event);
        };
        const persistEnd = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          endInputChange(event);
        };
        await render(
          <DateInputRange
            defaultDate={initialDate}
            startInputProps={{ onChange: persistStart }}
            endInputProps={{ onChange: persistEnd }}
            onDateValueChange={dateValueChange}
            onDateChange={dateChange}
          />,
        );
        await replaceDateInput("Start date", updatedDateValue.startDate);
        expect(startInputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue.startDate,
        );
        expect(dateValueChange).toHaveBeenCalledWith(expect.anything(), {
          startDate: updatedDateValue.startDate,
          endDate: initialDateValue.endDate,
        });
        expect(dateChange).not.toHaveBeenCalled();
        await userEvent.tab();
        assertDateChange(
          dateChange,
          {
            startDate: updatedFormattedDateValue.startDate,
            endDate: initialDateValue.endDate,
          },
          { startDate: updatedDate.startDate, endDate: initialDate.endDate },
          adapter,
        );

        await replaceDateInput("End date", updatedDateValue.endDate);
        expect(endInputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue.endDate,
        );
        expect(dateChange).toHaveBeenCalledTimes(1);
        await userEvent.tab();
        expect(dateValueChange).toHaveBeenCalledWith(
          expect.anything(),
          updatedFormattedDateValue,
        );
        assertDateChange(
          dateChange,
          updatedFormattedDateValue,
          updatedDate,
          adapter,
        );
        await expect
          .element(dateInput("Start date"))
          .toHaveValue(updatedFormattedDateValue.startDate);
        await expect
          .element(dateInput("End date"))
          .toHaveValue(updatedFormattedDateValue.endDate);
        await expect
          .element(dateInput("Start date"))
          .not.toHaveAttribute("aria-invalid", "true");
        await expect
          .element(dateInput("End date"))
          .not.toHaveAttribute("aria-invalid", "true");
      });
    });

    describe("controlled component", () => {
      let startInputChange: ReturnType<
        typeof vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>
      >;
      let endInputChange: ReturnType<
        typeof vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>
      >;
      let dateChange: ReturnType<
        typeof vi.fn<
          (
            event: SyntheticEvent,
            newDate: DateRangeSelection | null | undefined,
            details: DateInputRangeDetails,
          ) => void
        >
      >;
      let dateValueChange: ReturnType<
        typeof vi.fn<
          (event: SyntheticEvent | null, newValue: DateInputRangeValue) => void
        >
      >;

      function ControlledDateInput() {
        const [date, setDate] = useState<DateRangeSelection | null | undefined>(
          initialDate,
        );
        const handleDateChange = (
          event: SyntheticEvent,
          newDate: DateRangeSelection | null | undefined,
          details: DateInputRangeDetails,
        ) => {
          event.persist();
          setDate(newDate);
          dateChange(event, newDate, details);
        };
        const handleStart = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          startInputChange(event);
        };
        const handleEnd = (event: ChangeEvent<HTMLInputElement>) => {
          event.persist();
          endInputChange(event);
        };
        return (
          <DateInputRange
            date={date}
            startInputProps={{ onChange: handleStart }}
            endInputProps={{ onChange: handleEnd }}
            onDateValueChange={dateValueChange}
            onDateChange={handleDateChange}
          />
        );
      }

      beforeEach(async () => {
        startInputChange = vi.fn();
        endInputChange = vi.fn();
        dateChange = vi.fn();
        dateValueChange = vi.fn();
        await render(<ControlledDateInput />);
      });

      it("SHOULD call onDateChange only if value changes", async () => {
        await replaceDateInput("Start date", updatedDateValue.startDate);
        expect(startInputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue.startDate,
        );
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(1);
        assertDateChange(
          dateChange,
          {
            startDate: updatedDateValue.startDate,
            endDate: initialDateValue.endDate,
          },
          { startDate: updatedDate.startDate, endDate: initialDate.endDate },
          adapter,
        );
        await replaceDateInput("End date", updatedDateValue.endDate);
        expect(endInputChange.mock.calls.at(-1)?.[0].target.value).toBe(
          updatedDateValue.endDate,
        );
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(2);
        assertDateChange(dateChange, updatedDateValue, updatedDate, adapter);
      });

      it("SHOULD be able to clear date and update", async () => {
        await replaceDateInput("End date", updatedDateValue.endDate);
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(1);

        await replaceDateInput("Start date", "");
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(2);
        expect(dateValueChange).toHaveBeenCalledWith(expect.anything(), {
          startDate: "",
          endDate: updatedDateValue.endDate,
        });
        assertDateChange(
          dateChange,
          { startDate: "", endDate: updatedDateValue.endDate },
          { startDate: undefined, endDate: updatedDate.endDate },
          adapter,
        );

        await replaceDateInput("Start date", updatedDateValue.startDate);
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(3);
        assertDateChange(dateChange, updatedDateValue, updatedDate, adapter);

        await replaceDateInput("End date", "");
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(4);
        assertDateChange(
          dateChange,
          { startDate: updatedDateValue.startDate, endDate: "" },
          { startDate: updatedDate.startDate, endDate: undefined },
          adapter,
        );

        await replaceDateInput("End date", updatedDateValue.endDate);
        await userEvent.tab();
        expect(dateChange).toHaveBeenCalledTimes(5);
        assertDateChange(dateChange, updatedDateValue, updatedDate, adapter);
      });
    });
  });
}

describe("GIVEN a DateInputRange", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(adapterMoment);

  describe("Accessibility", () => {
    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapterMoment });

    it("SHOULD have accessible names via aria-labelledby when wrapped in a FormField", async () => {
      await render(
        <FormField>
          <FormFieldLabel>Date Range</FormFieldLabel>
          <DateInputRange
            defaultValue={{ startDate: "05 Jan 2025", endDate: "15 Jan 2025" }}
          />
        </FormField>,
      );
      expect(
        dateInput("Start date").element().getAttribute("aria-labelledby"),
      ).toBeTruthy();
      expect(
        dateInput("End date").element().getAttribute("aria-labelledby"),
      ).toBeTruthy();
    });

    it("SHOULD differentiate the input aria-labelledby values", async () => {
      await render(
        <FormField>
          <FormFieldLabel>Date Range</FormFieldLabel>
          <DateInputRange
            defaultValue={{ startDate: "05 Jan 2025", endDate: "15 Jan 2025" }}
          />
        </FormField>,
      );
      const labelId = page.getByText("Date Range").element().getAttribute("id");
      const startLabelledBy = dateInput("Start date")
        .element()
        .getAttribute("aria-labelledby");
      const endLabelledBy = dateInput("End date")
        .element()
        .getAttribute("aria-labelledby");
      expect(labelId).toBeTruthy();
      expect(startLabelledBy).toContain(labelId);
      expect(endLabelledBy).toContain(labelId);
      expect(startLabelledBy).not.toBe(endLabelledBy);
    });
  });
});
