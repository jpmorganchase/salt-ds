import { FormField, FormFieldLabel } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  createMonthYearRangeSelectionAnnouncement,
  createMonthYearSingleSelectionAnnouncement,
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
  openOnClick?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  isMonthUnselectable?: (date: DateFrameworkType) => string | false;
}) {
  return (
    <DatePicker
      selectionVariant="single"
      createAnnouncement={createMonthYearSingleSelectionAnnouncement}
      defaultSelectedDate={props.defaultSelectedDate}
      minDate={props.minDate}
      maxDate={props.maxDate}
      openOnClick={props.openOnClick}
      defaultOpen={props.defaultOpen}
      disabled={props.disabled}
      readOnly={props.readOnly}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput
          format={MONTH_YEAR_FORMAT}
          parse={(inputDate, format) =>
            parseMonthYear(props.adapter, inputDate, format)
          }
        />
      </DatePickerTrigger>
      <DatePickerOverlay aria-label="Month picker" aria-describedby={undefined}>
        <MonthYearSinglePanel
          helperText={props.helperText}
          isMonthUnselectable={props.isMonthUnselectable}
        />
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
  minDate?: DateFrameworkType;
  maxDate?: DateFrameworkType;
  openOnClick?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  isMonthUnselectable?: (date: DateFrameworkType) => string | false;
}) {
  return (
    <DatePicker
      selectionVariant="range"
      createAnnouncement={createMonthYearRangeSelectionAnnouncement}
      defaultSelectedDate={props.defaultSelectedDate}
      minDate={props.minDate}
      maxDate={props.maxDate}
      openOnClick={props.openOnClick}
      disabled={props.disabled}
      readOnly={props.readOnly}
    >
      <DatePickerTrigger>
        <DatePickerRangeInput
          format={MONTH_YEAR_FORMAT}
          parse={(inputDate, field, format) =>
            parseMonthYearRange(props.adapter, inputDate, field, format)
          }
        />
      </DatePickerTrigger>
      <DatePickerOverlay aria-label="Month picker" aria-describedby={undefined}>
        <MonthYearRangePanel
          helperText={props.helperText}
          isMonthUnselectable={props.isMonthUnselectable}
        />
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
  return page.getByRole("dialog", { name: "Month picker" });
}

async function expectOverlayClosed() {
  await expect.element(page.getByRole("application")).not.toBeInTheDocument();
}

function pressOutside() {
  for (const type of [
    "pointerdown",
    "mousedown",
    "pointerup",
    "mouseup",
    "click",
  ]) {
    document.body.dispatchEvent(
      type.startsWith("pointer")
        ? new PointerEvent(type, { bubbles: true, cancelable: true })
        : new MouseEvent(type, { bubbles: true, cancelable: true }),
    );
  }
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
      it("SHOULD open the calendar overlay with an application region", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        const trigger = calendarTrigger();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.click();
        await expect.element(overlay()).toBeInTheDocument();
        await expect
          .element(page.getByRole("application"))
          .toHaveAccessibleName("2026 months group");
        await expect.element(page.getByRole("grid")).not.toBeInTheDocument();
      });

      it("SHOULD focus the selected month when opening", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        await calendarTrigger().click();
        const selectedMonth = page.getByRole("button", {
          name: `${adapter.format(march2026, MONTH_YEAR_FORMAT)}, selected`,
        });
        await expect.element(selectedMonth).toHaveFocus();
      });

      it("SHOULD focus the current month when no date is selected", async () => {
        await render(<SingleFixture adapter={adapter} />);
        await calendarTrigger().click();
        const july = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "July 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect.element(july).toHaveFocus();
      });

      it("SHOULD focus the first selectable month when the current month is out of range", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            minDate={startOfMonth(adapter, "September 2026")}
            maxDate={september2027}
          />,
        );
        await calendarTrigger().click();
        await expect
          .element(
            page.getByRole("button", {
              name: `${adapter.format(startOfMonth(adapter, "September 2026"), MONTH_YEAR_FORMAT)}, minimum date`,
            }),
          )
          .toHaveFocus();
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

      it("SHOULD announce a typed month in month wording", async () => {
        await render(<SingleFixture adapter={adapter} />);
        await textInput().fill(adapter.format(march2026, MONTH_YEAR_FORMAT));
        await userEvent.keyboard("{Tab}");
        await expect
          .element(
            page.getByText(
              `${adapter.format(march2026, MONTH_YEAR_FORMAT)}, selected`,
              { exact: true },
            ),
          )
          .toBeInTheDocument();
      });

      it("SHOULD move focus to the start and end of the row with Home and End", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={may2026} />,
        );
        await calendarTrigger().click();
        await userEvent.keyboard("{Home}");
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(april2026, MONTH_YEAR_FORMAT),
            }),
          )
          .toHaveFocus();
        await userEvent.keyboard("{End}");
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(june2026, MONTH_YEAR_FORMAT),
            }),
          )
          .toHaveFocus();
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
          name: adapter.format(march2026, MONTH_YEAR_FORMAT),
        });
        await expect.element(march).toHaveAttribute("aria-disabled", "true");
        await userEvent.keyboard("{ArrowUp}{ArrowLeft}");
        await expect.element(march).toHaveFocus();
        await expect.element(page.getByRole("tooltip")).toBeInTheDocument();
        await expect.element(march).toHaveAccessibleDescription("out of range");
        const april = page.getByRole("button", {
          name: `${adapter.format(april2026, MONTH_YEAR_FORMAT)}, minimum date`,
        });
        await expect.element(april).not.toHaveAttribute("aria-disabled");
        await expect
          .element(
            page.getByRole("button", {
              name: `${adapter.format(startOfMonth(adapter, "September 2026"), MONTH_YEAR_FORMAT)}, maximum date`,
            }),
          )
          .toBeInTheDocument();
      });

      it("SHOULD move focus onto unselectable months but NOT to a year outside min/max", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            minDate={april2026}
            maxDate={september2026}
          />,
        );
        await calendarTrigger().click();
        // Out-of-range months in the visible year stay reachable.
        await userEvent.keyboard("{ArrowDown}");
        const october = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "October 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect.element(october).toHaveFocus();
        await expect.element(october).toHaveAttribute("aria-disabled", "true");
        // December is the last month of the last allowed year.
        await userEvent.keyboard("{ArrowRight}{ArrowRight}");
        const december = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "December 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect.element(december).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await expect.element(december).toHaveFocus();
        await expect
          .element(page.getByRole("application"))
          .toHaveAccessibleName("2026 months group");
        await expect
          .element(overlay().getByText("Future dates are out of range"))
          .toBeInTheDocument();
        // January is the first month of the first allowed year.
        await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}{Home}");
        const january = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "January 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect.element(january).toHaveFocus();
        await userEvent.keyboard("{ArrowLeft}");
        await expect.element(january).toHaveFocus();
        await expect
          .element(page.getByRole("application"))
          .toHaveAccessibleName("2026 months group");
        await expect
          .element(overlay().getByText("Past dates are out of range"))
          .toBeInTheDocument();
      });

      it("SHOULD keep the year buttons focusable when the min/max year is reached", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            minDate={april2026}
            maxDate={september2026}
          />,
        );
        await calendarTrigger().click();
        const previous = page.getByRole("button", {
          name: "Past dates are out of range",
        });
        await expect.element(previous).toHaveAttribute("aria-disabled", "true");
        await expect.element(previous).not.toHaveAttribute("disabled");
        await userEvent.keyboard("{Tab}");
        await expect.element(previous).toHaveFocus();
        await expect.element(page.getByRole("tooltip")).toBeInTheDocument();
        await expect.element(previous).not.toHaveAccessibleDescription();
        const next = page.getByRole("button", {
          name: "Future dates are out of range",
        });
        await expect.element(next).toHaveAttribute("aria-disabled", "true");
        await expect.element(next).not.toHaveAttribute("disabled");
      });

      it("SHOULD announce the new year when a year button is activated", async () => {
        await render(<SingleFixture adapter={adapter} />);
        await calendarTrigger().click();
        await page.getByRole("button", { name: "Next year" }).click();
        await expect.element(overlay().getByText("2027.")).toBeInTheDocument();
        await page.getByRole("button", { name: "Previous year" }).click();
        await expect.element(overlay().getByText("2026.")).toBeInTheDocument();
      });

      it("SHOULD keep focus on the previous year button when it reaches the min year", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            minDate={startOfMonth(adapter, "April 2025")}
            maxDate={september2026}
          />,
        );
        await calendarTrigger().click();
        await page.getByRole("button", { name: "Previous year" }).click();
        await expect
          .element(
            page.getByRole("button", { name: "Past dates are out of range" }),
          )
          .toHaveFocus();
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

      it("SHOULD open the overlay when using down arrow", async () => {
        await render(<SingleFixture adapter={adapter} />);
        const trigger = calendarTrigger();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      });

      it("SHOULD be able to enable the overlay to open on click", async () => {
        await render(<SingleFixture adapter={adapter} openOnClick />);
        await expectOverlayClosed();
        await textInput().click();
        await expect.element(page.getByRole("application")).toBeInTheDocument();
      });

      it("SHOULD NOT be able to enable the overlay to open on click, if disabled", async () => {
        await render(<SingleFixture adapter={adapter} openOnClick disabled />);
        await textInput().click({ force: true });
        await expectOverlayClosed();
      });

      it("SHOULD keep the overlay open while focus stays within the picker", async () => {
        await render(<SingleFixture adapter={adapter} />);
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        await textInput().click();
        await userEvent.tab();
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        pressOutside();
        await expectOverlayClosed();
      });

      it("SHOULD dismiss the overlay on an outside press", async () => {
        await render(<SingleFixture adapter={adapter} defaultOpen />);
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        pressOutside();
        await expectOverlayClosed();
      });

      it("SHOULD not show the calendar button WHEN readOnly", async () => {
        await render(<SingleFixture adapter={adapter} readOnly />);
        await expect
          .element(page.getByRole("button", { name: "Open Calendar" }))
          .not.toBeInTheDocument();
      });

      it("SHOULD not open the overlay when using down arrow WHEN readOnly", async () => {
        await render(<SingleFixture adapter={adapter} readOnly />);
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expectOverlayClosed();
      });

      it("SHOULD not open the overlay if defaultOpen is set WHEN readOnly", async () => {
        await render(<SingleFixture adapter={adapter} readOnly defaultOpen />);
        await expectOverlayClosed();
      });

      it("SHOULD disable the calendar button and input WHEN disabled", async () => {
        await render(<SingleFixture adapter={adapter} disabled />);
        await expect
          .element(page.getByRole("button", { name: "Open Calendar" }))
          .toBeDisabled();
        await expect.element(textInput()).toBeDisabled();
      });

      it("SHOULD be able to tab between all elements", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        const selectedMonth = page.getByRole("button", {
          name: `${adapter.format(march2026, MONTH_YEAR_FORMAT)}, selected`,
        });
        await expect.element(selectedMonth).toHaveFocus();
        for (const label of ["Previous year", "Year Dropdown", "Next year"]) {
          await userEvent.tab();
          await expect.element(page.getByLabelText(label)).toHaveFocus();
        }
        await userEvent.tab();
        await expect.element(selectedMonth).toHaveFocus();
        await userEvent.keyboard("{Escape}");
        await expectOverlayClosed();
        await expect.element(textInput()).toHaveFocus();
        await userEvent.tab();
        const trigger = page.getByLabelText("Open Calendar");
        await expect.element(trigger).toHaveFocus();
        await userEvent.tab();
        await expect.element(trigger).not.toHaveFocus();
      });

      it("SHOULD only be able to select a month between min/max", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            minDate={april2026}
            maxDate={september2026}
          />,
        );
        await calendarTrigger().click();
        await page
          .getByRole("button", {
            name: adapter.format(march2026, MONTH_YEAR_FORMAT),
          })
          .click({ force: true });
        await expect.element(textInput()).toHaveValue("");
        await expect.element(overlay()).toBeInTheDocument();
        await page
          .getByRole("button", {
            name: adapter.format(may2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await expect
          .element(textInput())
          .toHaveValue(adapter.format(may2026, MONTH_YEAR_FORMAT));
      });

      it("SHOULD default to today's year when opening with no date set", async () => {
        await render(<SingleFixture adapter={adapter} />);
        await calendarTrigger().click();
        await expect
          .element(page.getByRole("application"))
          .toHaveAccessibleName("2026 months group");
      });

      it("SHOULD render helper text in the panel when opened", async () => {
        await render(
          <SingleFixture adapter={adapter} helperText="Pick a month" />,
        );
        await calendarTrigger().click();
        await expect
          .element(overlay().getByText("Pick a month"))
          .toBeInTheDocument();
      });

      it("SHOULD not be able to select un-selectable months", async () => {
        await render(
          <SingleFixture
            adapter={adapter}
            isMonthUnselectable={(date) =>
              adapter.isSame(date, may2026, "month")
                ? "May is unavailable"
                : false
            }
          />,
        );
        await calendarTrigger().click();
        const may = page.getByRole("button", {
          name: adapter.format(may2026, MONTH_YEAR_FORMAT),
        });
        await expect.element(may).toHaveAttribute("aria-disabled", "true");
        await may.click({ force: true });
        await expect.element(textInput()).toHaveValue("");
        await expect.element(overlay()).toBeInTheDocument();
        await may.hover();
        await expect
          .element(may)
          .toHaveAccessibleDescription("May is unavailable");
      });

      it("SHOULD support format prop on the input", async () => {
        await render(
          <SingleFixture adapter={adapter} defaultSelectedDate={march2026} />,
        );
        await expect
          .element(textInput())
          .toHaveValue(adapter.format(march2026, MONTH_YEAR_FORMAT));
      });
    });

    describe("GIVEN a MonthYearRangePanel", () => {
      it("SHOULD render two independent grids", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await expect
          .element(page.getByRole("application", { name: "2026 months group" }))
          .toBeInTheDocument();
        await expect
          .element(page.getByRole("application", { name: "2027 months group" }))
          .toBeInTheDocument();
      });

      it("SHOULD announce a prompt to select the start month when opened", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await expect
          .poll(() => overlay().element().textContent, { interval: 50 })
          .toContain("Select start date.");
      });

      it("SHOULD set the start date on first selection and keep the overlay open", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(june2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await expect
          .element(overlay().getByText("Select end date."))
          .toBeInTheDocument();
        const [startInput, endInput] = rangeInputs();
        await expect
          .element(startInput)
          .toHaveValue(adapter.format(june2026, MONTH_YEAR_FORMAT));
        await expect.element(endInput).toHaveValue("");
        await expect.element(overlay()).toBeInTheDocument();
      });

      it("SHOULD name a later month as the end choice once a start is selected", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(june2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await userEvent.keyboard("{ArrowRight}");
        await expect
          .element(
            page.getByRole("button", {
              name: `${adapter.format(startOfMonth(adapter, "July 2026"), MONTH_YEAR_FORMAT)}, select as end date`,
            }),
          )
          .toHaveFocus();
      });

      it("SHOULD name earlier months as a change of start once a start is selected", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(june2026, MONTH_YEAR_FORMAT),
          })
          .click();
        await expect
          .element(
            page.getByRole("button", {
              name: `Change start date to ${adapter.format(may2026, MONTH_YEAR_FORMAT)}`,
            }),
          )
          .toBeInTheDocument();
        await expect
          .element(
            page.getByRole("button", {
              name: `Change start date to ${adapter.format(startOfMonth(adapter, "January 2026"), MONTH_YEAR_FORMAT)}`,
            }),
          )
          .toBeInTheDocument();
        await userEvent.keyboard("{ArrowLeft}");
        await userEvent.keyboard("{Enter}");
        await expect
          .element(
            page.getByRole("button", {
              name: `Start date: ${adapter.format(may2026, MONTH_YEAR_FORMAT)}, selected`,
            }),
          )
          .toHaveFocus();
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
          name: `Start date: ${adapter.format(march2026, MONTH_YEAR_FORMAT)}, selected`,
        });
        const middle = page.getByRole("button", {
          name: `In range: ${adapter.format(june2026, MONTH_YEAR_FORMAT)}, selected`,
        });
        const end = page.getByRole("button", {
          name: `End date: ${adapter.format(
            startOfMonth(adapter, "September 2026"),
            MONTH_YEAR_FORMAT,
          )}, selected`,
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
              name: `End date: ${adapter.format(
                startOfMonth(adapter, "September 2027"),
                MONTH_YEAR_FORMAT,
              )}, selected`,
            }),
          )
          .toBeInTheDocument();
      });

      it("SHOULD have accessible name via aria-labelledby in a FormField (single)", async () => {
        await render(
          <FormField>
            <FormFieldLabel>Select a month</FormFieldLabel>
            <DatePicker
              selectionVariant="single"
              createAnnouncement={createMonthYearSingleSelectionAnnouncement}
            >
              <DatePickerSingleInput
                format={MONTH_YEAR_FORMAT}
                parse={(inputDate, format) =>
                  parseMonthYear(adapter, inputDate, format)
                }
              />
              <DatePickerOverlay
                aria-label="Month picker"
                aria-describedby={undefined}
              >
                <MonthYearSinglePanel />
              </DatePickerOverlay>
            </DatePicker>
          </FormField>,
        );
        const input = textInput().element();
        expect(input.getAttribute("aria-labelledby")).toMatch(/\S/);
      });

      it("SHOULD have accessible names via aria-labelledby in a FormField (range)", async () => {
        await render(
          <FormField>
            <FormFieldLabel>Select a month range</FormFieldLabel>
            <DatePicker
              selectionVariant="range"
              createAnnouncement={createMonthYearRangeSelectionAnnouncement}
            >
              <DatePickerRangeInput
                format={MONTH_YEAR_FORMAT}
                parse={(inputDate, field, format) =>
                  parseMonthYearRange(adapter, inputDate, field, format)
                }
              />
              <DatePickerOverlay
                aria-label="Month picker"
                aria-describedby={undefined}
              >
                <MonthYearRangePanel />
              </DatePickerOverlay>
            </DatePicker>
          </FormField>,
        );
        const [startInput, endInput] = rangeInputs();
        expect(startInput.element().getAttribute("aria-labelledby")).toMatch(
          /\S/,
        );
        expect(endInput.element().getAttribute("aria-labelledby")).toMatch(
          /\S/,
        );
      });

      it("SHOULD NOT name the year dropdown from the FormField label (single)", async () => {
        await render(
          <FormField>
            <FormFieldLabel>Select a month</FormFieldLabel>
            <SingleFixture adapter={adapter} />
          </FormField>,
        );
        await calendarTrigger().click();
        await expect
          .element(page.getByRole("combobox", { name: "Year Dropdown" }))
          .toBeInTheDocument();
      });

      it("SHOULD name the dialog from the FormField label without a description", async () => {
        await render(
          <FormField>
            <FormFieldLabel>Select a month</FormFieldLabel>
            <SingleFixture adapter={adapter} />
          </FormField>,
        );
        await calendarTrigger().click();
        const dialog = page.getByRole("dialog", { name: "Select a month" });
        await expect.element(dialog).toBeInTheDocument();
        await expect.element(dialog).not.toHaveAttribute("aria-describedby");
      });

      it("SHOULD use aria-disabled on the months when the picker is disabled", async () => {
        await render(
          <DatePicker
            selectionVariant="single"
            createAnnouncement={createMonthYearSingleSelectionAnnouncement}
            disabled
            open
          >
            <DatePickerTrigger>
              <DatePickerSingleInput format={MONTH_YEAR_FORMAT} />
            </DatePickerTrigger>
            <DatePickerOverlay
              aria-label="Month picker"
              aria-describedby={undefined}
            >
              <MonthYearSinglePanel />
            </DatePickerOverlay>
          </DatePicker>,
        );
        const july = page.getByRole("button", {
          name: adapter.format(
            startOfMonth(adapter, "July 2026"),
            MONTH_YEAR_FORMAT,
          ),
        });
        await expect.element(july).toHaveAttribute("aria-disabled", "true");
        await expect.element(july).not.toHaveAttribute("disabled");
      });

      it("SHOULD focus the current month in the start grid when no range is selected", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(
                startOfMonth(adapter, "July 2026"),
                MONTH_YEAR_FORMAT,
              ),
            }),
          )
          .toHaveFocus();
      });

      it("SHOULD NOT name the year dropdowns from the FormField label (range)", async () => {
        await render(
          <FormField>
            <FormFieldLabel>Select a month range</FormFieldLabel>
            <RangeFixture adapter={adapter} />
          </FormField>,
        );
        await calendarTrigger(0).click();
        await expect
          .element(page.getByRole("combobox", { name: "Year Dropdown" }).nth(1))
          .toBeInTheDocument();
      });

      it("SHOULD open the overlay when using down arrow", async () => {
        await render(<RangeFixture adapter={adapter} />);
        const trigger = calendarTrigger(0);
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        const [startInput] = rangeInputs();
        await startInput.click();
        await userEvent.keyboard("{ArrowDown}");
        await expect
          .element(page.getByRole("application", { name: "2026 months group" }))
          .toBeInTheDocument();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      });

      it("SHOULD be able to enable the overlay to open on click", async () => {
        await render(<RangeFixture adapter={adapter} openOnClick />);
        await expectOverlayClosed();
        const [startInput] = rangeInputs();
        await startInput.click();
        await expect.element(overlay()).toBeInTheDocument();
      });

      it("SHOULD NOT open on click if disabled", async () => {
        await render(<RangeFixture adapter={adapter} openOnClick disabled />);
        const [startInput] = rangeInputs();
        await startInput.click({ force: true });
        await expectOverlayClosed();
      });

      it("SHOULD dismiss the overlay on an outside press", async () => {
        await render(<RangeFixture adapter={adapter} />);
        const [startInput] = rangeInputs();
        await startInput.click();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(overlay()).toBeInTheDocument();
        pressOutside();
        await expectOverlayClosed();
      });

      it("SHOULD not show the calendar button WHEN readOnly", async () => {
        await render(<RangeFixture adapter={adapter} readOnly />);
        await expect
          .element(page.getByRole("button", { name: "Open Calendar" }))
          .not.toBeInTheDocument();
      });

      it("SHOULD not open the overlay when using down arrow WHEN readOnly", async () => {
        await render(<RangeFixture adapter={adapter} readOnly />);
        const [startInput] = rangeInputs();
        await startInput.click();
        await userEvent.keyboard("{ArrowDown}");
        await expectOverlayClosed();
      });

      it("SHOULD disable the calendar button and inputs WHEN disabled", async () => {
        await render(<RangeFixture adapter={adapter} disabled />);
        await expect
          .element(page.getByRole("button", { name: "Open Calendar" }))
          .toBeDisabled();
        const [startInput, endInput] = rangeInputs();
        await expect.element(startInput).toBeDisabled();
        await expect.element(endInput).toBeDisabled();
      });

      it("SHOULD be able to tab between all elements", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            defaultSelectedDate={{
              startDate: march2026,
              endDate: september2026,
            }}
          />,
        );
        const [startInput] = rangeInputs();
        await startInput.click();
        await userEvent.keyboard("{ArrowDown}");
        const startMonth = page.getByRole("button", {
          name: `Start date: ${adapter.format(march2026, MONTH_YEAR_FORMAT)}, selected`,
        });
        await expect.element(startMonth).toHaveFocus();
        for (const region of ["2027 months group", "2026 months group"]) {
          for (const label of ["Previous year", "Year Dropdown", "Next year"]) {
            await userEvent.tab();
            await expect
              .element(
                page
                  .getByRole("application", { name: region })
                  .getByLabelText(label),
              )
              .toHaveFocus();
          }
          await userEvent.tab();
        }
        await expect.element(startMonth).toHaveFocus();
        await userEvent.keyboard("{Escape}");
        await expectOverlayClosed();
      });

      it("SHOULD only be able to select a month between min/max", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            minDate={april2026}
            maxDate={september2027}
          />,
        );
        await calendarTrigger(0).click();
        await page
          .getByRole("button", {
            name: adapter.format(march2026, MONTH_YEAR_FORMAT),
          })
          .click({ force: true });
        await expect.element(rangeInputs()[0]).toHaveValue("");
        await page
          .getByRole("button", {
            name: adapter.format(may2026, MONTH_YEAR_FORMAT),
          })
          .click();
        const [startInput, endInput] = rangeInputs();
        await expect
          .element(startInput)
          .toHaveValue(adapter.format(may2026, MONTH_YEAR_FORMAT));
        await expect.element(endInput).toHaveValue("");
      });

      it("SHOULD keep the end grid next year button enabled before the max year", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            minDate={april2026}
            maxDate={endOfMonth(adapter, "September 2028")}
          />,
        );
        await calendarTrigger(0).click();
        await expect
          .element(
            page
              .getByRole("application", { name: "2026 months group" })
              .getByRole("button", { name: "Past dates are out of range" }),
          )
          .toHaveAttribute("aria-disabled", "true");
        await expect
          .element(
            page
              .getByRole("application", { name: "2027 months group" })
              .getByRole("button", { name: "Next year" }),
          )
          .not.toHaveAttribute("aria-disabled");
      });

      it("SHOULD default to today's year when opening with no date set", async () => {
        await render(<RangeFixture adapter={adapter} />);
        await calendarTrigger(0).click();
        await expect
          .element(page.getByRole("application", { name: "2026 months group" }))
          .toBeInTheDocument();
        await expect
          .element(page.getByRole("application", { name: "2027 months group" }))
          .toBeInTheDocument();
      });

      it("SHOULD render helper text in the panel when opened", async () => {
        await render(
          <RangeFixture adapter={adapter} helperText="Pick a month range" />,
        );
        await calendarTrigger(0).click();
        await expect
          .element(overlay().getByText("Pick a month range"))
          .toBeInTheDocument();
      });

      it("SHOULD not be able to select un-selectable months", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            isMonthUnselectable={(date) =>
              adapter.isSame(date, may2026, "month")
                ? "May is unavailable"
                : false
            }
          />,
        );
        await calendarTrigger(0).click();
        const may = page.getByRole("button", {
          name: adapter.format(may2026, MONTH_YEAR_FORMAT),
        });
        await expect.element(may).toHaveAttribute("aria-disabled", "true");
        await may.click({ force: true });
        const [startInput] = rangeInputs();
        await expect.element(startInput).toHaveValue("");
        await expect.element(overlay()).toBeInTheDocument();
      });

      it("SHOULD render the default range in the inputs", async () => {
        await render(
          <RangeFixture
            adapter={adapter}
            defaultSelectedDate={{
              startDate: march2026,
              endDate: september2026,
            }}
          />,
        );
        const [startInput, endInput] = rangeInputs();
        await expect
          .element(startInput)
          .toHaveValue(adapter.format(march2026, MONTH_YEAR_FORMAT));
        await expect
          .element(endInput)
          .toHaveValue(adapter.format(september2026, MONTH_YEAR_FORMAT));
      });
    });
  });
}

registerAdapterTests(new AdapterDateFnsTZ());
registerAdapterTests(new AdapterDayjs());
registerAdapterTests(new AdapterLuxon());
registerAdapterTests(new AdapterMoment());
