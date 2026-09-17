import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  DateParserField,
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerSingleInput,
  DatePickerTrigger,
  MonthYearRangePanel,
  MonthYearSinglePanel,
} from "@salt-ds/date-components";
import MockDate from "mockdate";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

// Use an explicit UTC midday timestamp so US timezones stay on the same
// calendar date and the tests don't accidentally depend on London/local time.
const FIXED_NOW = new Date("2026-07-17T12:00:00.000Z");
const MONTH_YEAR_FORMAT = "MMMM YYYY";

const MONTH_YEAR_FORMATS = [
  "MMMM YYYY",
  "MMM YYYY",
  "MM/YYYY",
  "MM YYYY",
  "M/YYYY",
  "M YYYY",
];

function parseMonthYear(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
  inputDate: string,
  format: string,
) {
  const value = (inputDate ?? "").trim();
  if (!value.length) {
    return adapter.parse("", format);
  }
  for (const candidate of [format, ...MONTH_YEAR_FORMATS]) {
    const result = adapter.parse(value, candidate);
    if (result?.date && adapter.isValid(result.date as Date)) {
      return {
        ...result,
        date: adapter.startOf(result.date as Date, "month"),
        value,
      };
    }
  }
  return adapter.parse(value, format);
}

function parseMonthYearRange(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
  inputDate: string,
  field: DateParserField,
  format: string,
) {
  const result = parseMonthYear(adapter, inputDate, format);
  if (!result?.date || !adapter.isValid(result.date as Date)) {
    return result;
  }
  const normalised =
    field === DateParserField.END
      ? adapter.endOf(result.date as Date, "month")
      : adapter.startOf(result.date as Date, "month");
  return { ...result, date: normalised };
}

function SingleFixture(props: {
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>;
  defaultSelectedDate?: DateFrameworkType;
  minDate?: DateFrameworkType;
  maxDate?: DateFrameworkType;
}) {
  return (
    <DatePicker
      selectionVariant="single"
      defaultSelectedDate={props.defaultSelectedDate}
      minDate={props.minDate}
      maxDate={props.maxDate}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput
          format={MONTH_YEAR_FORMAT}
          parse={(inputDate, format) =>
            parseMonthYear(props.adapter, inputDate, format)
          }
        />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <MonthYearSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
}

function RangeFixture(props: {
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>;
  defaultSelectedDate?: {
    startDate: DateFrameworkType | null;
    endDate: DateFrameworkType | null;
  };
}) {
  return (
    <DatePicker
      selectionVariant="range"
      defaultSelectedDate={props.defaultSelectedDate}
    >
      <DatePickerTrigger>
        <DatePickerRangeInput
          format={MONTH_YEAR_FORMAT}
          parse={(inputDate, field, format) =>
            parseMonthYearRange(props.adapter, inputDate, field, format)
          }
        />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <MonthYearRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
}

function textInput() {
  const element = document.querySelector<HTMLInputElement>(
    ".saltDatePickerSingleInput input",
  );
  if (!element) throw new Error("Month-year input was not rendered");
  return page.elementLocator(element);
}

function rangeInputs() {
  const elements = document.querySelectorAll<HTMLInputElement>(
    ".saltDateInput-input",
  );
  if (elements.length < 2) throw new Error("Range inputs were not rendered");
  return [
    page.elementLocator(elements[0]),
    page.elementLocator(elements[1]),
  ] as const;
}

function calendarTrigger(index = 0) {
  const elements = document.querySelectorAll<HTMLButtonElement>(
    'button[aria-label="Open Calendar"]',
  );
  const element = elements.item(index);
  if (!element) throw new Error("Calendar trigger was not rendered");
  return page.elementLocator(element);
}

function overlay() {
  return page.getByRole("dialog", { name: "date picker" });
}

function getParsedMonth(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
  label: string,
) {
  const result = adapter.parse(label, MONTH_YEAR_FORMAT).date;
  if (!result || !adapter.isValid(result)) {
    throw new Error(`Unable to parse month-year label: ${label}`);
  }
  return result;
}

function startOfMonth(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
  label: string,
) {
  return adapter.startOf(getParsedMonth(adapter, label), "month");
}

function endOfMonth(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
  label: string,
) {
  return adapter.endOf(getParsedMonth(adapter, label), "month");
}

function registerAdapterTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(FIXED_NOW));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapter });

    const march2026 = startOfMonth(adapter, "March 2026");
    const april2026 = startOfMonth(adapter, "April 2026");
    const may2026 = startOfMonth(adapter, "May 2026");
    const june2026 = startOfMonth(adapter, "June 2026");
    const september2026 = endOfMonth(adapter, "September 2026");
    const september2027 = endOfMonth(adapter, "September 2027");

    describe("GIVEN a MonthYearSinglePanel", () => {
      it("SHOULD open the calendar overlay with correct grid structure", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        const trigger = calendarTrigger();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.click();
        await expect.element(overlay()).toBeInTheDocument();
        const grid = page.getByRole("grid");
        await expect.element(grid).toHaveAttribute("aria-rowcount", "4");
        await expect.element(grid).toHaveAttribute("aria-colcount", "3");
      });

      it("SHOULD focus the selected month when opening", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        await calendarTrigger().click();
        const selectedMonth = page.getByRole("button", {
          name: adapter.format(march2026, MONTH_YEAR_FORMAT),
        });
        await expect.element(selectedMonth).toHaveFocus();
        await expect
          .element(selectedMonth)
          .toHaveAttribute("aria-pressed", "true");
      });

      it("SHOULD focus January in the current year when no date is selected", async () => {
        await render(<SingleFixture adapter={adapter} />);
        await calendarTrigger().click();
        const january = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "January 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect.element(january).toHaveFocus();
      });

      it("SHOULD allow keyboard navigation between months", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        await calendarTrigger().click();
        await userEvent.keyboard("{ArrowRight}");
        const april = page.getByRole("button", {
          name: adapter.format(april2026, MONTH_YEAR_FORMAT),
        });
        await expect.element(april).toHaveFocus();
      });

      it("SHOULD disable months outside min/max range", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            minDate={april2026}
            maxDate={september2026}
          />,
        );
        await calendarTrigger().click();
        const march = page.getByRole("button", {
          name: new RegExp(`^${adapter.format(march2026, MONTH_YEAR_FORMAT)}`),
        });
        await expect.element(march).toHaveAttribute("aria-disabled", "true");
        const april = page.getByRole("button", {
          name: adapter.format(april2026, MONTH_YEAR_FORMAT),
        });
        await expect.element(april).not.toHaveAttribute("aria-disabled");
      });

      it("SHOULD update the input, close the overlay, and restore focus after selecting a month", async () => {
        await render(<SingleFixture adapter={adapter} />);
        const trigger = calendarTrigger();
        await trigger.click();
        await page
          .getByRole("button", {
            name: adapter.format(may2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await expect
          .element(textInput())
          .toHaveValue(adapter.format(may2026, MONTH_YEAR_FORMAT));
        await expect.element(overlay()).not.toBeInTheDocument();
        await expect.element(trigger).toHaveFocus();
      });
    });

    describe("GIVEN a MonthYearRangePanel", () => {
      it("SHOULD render two independent grids", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await expect
          .element(page.getByRole("grid", { name: /^Start month/ }))
          .toBeInTheDocument();
        await expect
          .element(page.getByRole("grid", { name: /^End month/ }))
          .toBeInTheDocument();
      });

      it("SHOULD set the start date on first selection and keep the overlay open", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(june2026, MONTH_YEAR_FORMAT),
          })
          .click();
        const [startInput, endInput] = rangeInputs();
        await expect
          .element(startInput)
          .toHaveValue(adapter.format(june2026, MONTH_YEAR_FORMAT));
        await expect.element(endInput).toHaveValue("");
        await expect.element(overlay()).toBeInTheDocument();
      });

      it("SHOULD close the overlay when the range is complete", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(june2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await page
          .getByRole("button", {
            name: adapter.format(
              startOfMonth(adapter, "September 2027"),
              MONTH_YEAR_FORMAT,
            ),
          })
          .click();
        const [startInput, endInput] = rangeInputs();
        await expect
          .element(startInput)
          .toHaveValue(adapter.format(june2026, MONTH_YEAR_FORMAT));
        await expect
          .element(endInput)
          .toHaveValue(
            adapter.format(
              startOfMonth(adapter, "September 2027"),
              MONTH_YEAR_FORMAT,
            ),
          );
        await expect.element(overlay()).not.toBeInTheDocument();
      });

      it("SHOULD allow a same-year range to be selected from the first grid", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(june2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await page
          .getByRole("button", {
            name: adapter.format(
              startOfMonth(adapter, "September 2026"),
              MONTH_YEAR_FORMAT,
            ),
          })
          .click();
        const [startInput, endInput] = rangeInputs();
        await expect
          .element(startInput)
          .toHaveValue(adapter.format(june2026, MONTH_YEAR_FORMAT));
        await expect
          .element(endInput)
          .toHaveValue(
            adapter.format(
              startOfMonth(adapter, "September 2026"),
              MONTH_YEAR_FORMAT,
            ),
          );
      });

      it("SHOULD highlight the selected range", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            defaultSelectedDate={{
              startDate: march2026,
              endDate: september2026,
            }}
          />,
        );
        await calendarTrigger(0).click();
        const start = page.getByRole("button", {
          name: adapter.format(march2026, MONTH_YEAR_FORMAT),
        });
        const middle = page.getByRole("button", {
          name: adapter.format(june2026, MONTH_YEAR_FORMAT),
        });
        const end = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "September 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect
          .element(start)
          .toHaveClass(/saltCalendarDay-selectedStart/);
        await expect
          .element(middle)
          .toHaveClass(/saltCalendarDay-selectedSpan/);
        await expect.element(end).toHaveClass(/saltCalendarDay-selectedEnd/);
      });

      it("SHOULD keep a cross-year end month selected consistently across adapters", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            defaultSelectedDate={{
              startDate: june2026,
              endDate: september2027,
            }}
          />,
        );
        await calendarTrigger(0).click();
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(
                startOfMonth(adapter, "September 2027"),
                MONTH_YEAR_FORMAT,
              ),
            }),
          )
          .toHaveAttribute("aria-pressed", "true");
      });
    });
  });
}

registerAdapterTests(new AdapterDateFnsTZ());
registerAdapterTests(new AdapterDayjs());
registerAdapterTests(new AdapterLuxon());
registerAdapterTests(new AdapterMoment());
