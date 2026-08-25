import { FormField, FormFieldLabel } from "@salt-ds/core";
import {
  DateDetailError,
  type DateFrameworkType,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  DatePicker,
  DatePickerActions,
  DatePickerOverlay,
  DatePickerRangeGridPanel,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import type { Dayjs } from "dayjs";
import type { DateTime } from "luxon";
import MockDate from "mockdate";
import type { Moment } from "moment/moment";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as datePickerStories from "~stories/date-picker/date-picker.stories";

const {
  Range,
  RangeControlled,
  RangeWithConfirmation,
  RangeWithCustomPanel,
  RangeWithCustomParser,
  RangeWithFormField,
  RangeWithMinMaxDate,
  RangeWithUnselectableDates,
  RangeCustomFormat,
  RangeWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: Storybook story type
} = datePickerStories as any;

function rangeInput(index: 0 | 1) {
  const elements = document.querySelectorAll<HTMLInputElement>(
    ".saltDatePickerRangeInput input",
  );
  const element = elements[index];
  if (!element) throw new Error(`Range input ${index} was not rendered`);
  return page.elementLocator(element);
}

const startInput = () => rangeInput(0);
const endInput = () => rangeInput(1);

async function replaceRangeInput(index: 0 | 1, value: string) {
  const input = rangeInput(index);
  await input.click();
  await input.fill(value);
  return input;
}

function calendarTrigger() {
  const element = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Open Calendar"]',
  );
  if (!element) throw new Error("Calendar trigger was not rendered");
  return page.elementLocator(element);
}

async function expectCalendarCount(count: number) {
  await expect
    .poll(async () => (await page.getByRole("application").elements()).length)
    .toBe(count);
}

async function openCalendar(expectedCount = 2) {
  await calendarTrigger().click();
  await expectCalendarCount(expectedCount);
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

function lastCall(spy: ReturnType<typeof vi.fn>) {
  const call = spy.mock.calls.at(-1);
  if (!call) throw new Error("Expected callback to have been called");
  return call;
}

async function chooseTimezone(timezone: string) {
  const dropdown = document.querySelector<HTMLButtonElement>(
    'button[aria-label="timezone dropdown"]',
  );
  if (!dropdown) throw new Error("Timezone dropdown was not rendered");
  await page.elementLocator(dropdown).click();
  const option = page.getByRole("option", { name: timezone });
  await option.hover();
  await option.click();
}

// biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
function getDayOfWeek(adapter: SaltDateAdapter<any>, day: DateFrameworkType) {
  if (adapter.lib === "luxon") return (day as DateTime).weekday;
  if (adapter.lib === "moment") return (day as Moment).day();
  if (adapter.lib === "dayjs") return (day as Dayjs).day();
  return (day as Date).getDay();
}

// biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
function isWeekend(adapter: SaltDateAdapter<any>, day: DateFrameworkType) {
  const dayOfWeek = getDayOfWeek(adapter, day);
  return adapter.lib === "luxon"
    ? dayOfWeek === 6 || dayOfWeek === 7
    : dayOfWeek === 0 || dayOfWeek === 6;
}

function registerAdapterTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(new Date(2024, 4, 6)));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapter });
    const initialRangeDateValue = {
      startDate: "05 Jan 2025",
      endDate: "06 Jan 2025",
    };
    const initialRangeDate = {
      startDate: adapter.parse("05/01/2025", "DD/MM/YYYY").date,
      endDate: adapter.parse("06/01/2025", "DD/MM/YYYY").date,
    };
    describe("WHEN default state", () => {
      it("SHOULD show calendar overlay when click the calendar icon button", async () => {
        await render(<RangeControlled />);
        const trigger = calendarTrigger();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.click();
        await expectCalendarCount(2);
        await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      });

      it("SHOULD open calendar overlay when using down arrow", async () => {
        await render(<Range />);
        const trigger = calendarTrigger();
        await startInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expectCalendarCount(2);
        await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      });

      it("SHOULD be able to enable the overlay to open on click", async () => {
        await render(<Range openOnClick />);
        await expectCalendarCount(0);
        await startInput().click();
        await expectCalendarCount(2);
        pressOutside();
        await expectCalendarCount(0);
        await endInput().click();
        await expectCalendarCount(2);
      });

      it("SHOULD NOT open on click if disabled", async () => {
        await render(<Range openOnClick disabled />);
        await startInput().click({ force: true });
        await endInput().click({ force: true });
        await expectCalendarCount(0);
      });

      it("SHOULD hide calendar upon focus out", async () => {
        await render(<Range />);
        await startInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expectCalendarCount(2);
        await startInput().click();
        await userEvent.tab();
        await expectCalendarCount(2);
        await userEvent.tab();
        await expectCalendarCount(2);
        pressOutside();
        await expectCalendarCount(0);
      });
    });

    describe("WHEN readOnly", () => {
      it("SHOULD not show calendar icon button", async () => {
        await render(<Range readOnly />);
        await expect
          .element(page.getByRole("button", { name: "Open Calendar" }))
          .not.toBeInTheDocument();
      });

      it("SHOULD not open overlay when using down arrow", async () => {
        await render(<Range readOnly />);
        await startInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expectCalendarCount(0);
      });
    });

    it("SHOULD disable calendar button and inputs WHEN disabled", async () => {
      await render(<Range disabled />);
      await expect.element(calendarTrigger()).toBeDisabled();
      await expect.element(startInput()).toBeDisabled();
      await expect.element(endInput()).toBeDisabled();
    });

    it("SHOULD be able to tab between all elements", async () => {
      await render(<Range defaultSelectedDate={initialRangeDate} />);
      const startMonthLabel = adapter.format(
        initialRangeDate.startDate,
        "MMMM YYYY",
      );
      const endMonthLabel = adapter.format(
        adapter.add(initialRangeDate.startDate, { months: 1 }),
        "MMMM YYYY",
      );
      await startInput().click();
      await userEvent.keyboard("{ArrowDown}");
      const selectedStart = page.getByRole("button", {
        name: `Start date: ${adapter.format(initialRangeDate.startDate, "dddd D MMMM YYYY")}, selected`,
      });
      await expect.element(selectedStart).toHaveFocus();
      const endNavigation = [
        [/Previous Month/, `Previous Month, ${endMonthLabel}`],
        [/Month Dropdown/, undefined],
        [/Year Dropdown/, undefined],
        [/Next Month/, `Next Month, ${endMonthLabel}`],
      ] as const;
      for (const [label, exactLabel] of endNavigation) {
        await userEvent.tab();
        const control = page.getByLabelText(label).nth(1);
        await expect.element(control).toHaveFocus();
        if (exactLabel) {
          await expect
            .element(control)
            .toHaveAttribute("aria-label", exactLabel);
        }
      }
      await userEvent.tab();
      const startOfEndCalendar = adapter.startOf(
        adapter.add(initialRangeDate.startDate, { months: 1 }),
        "month",
      );
      await expect
        .element(
          page.getByRole("button", {
            name: `Start new range: ${adapter.format(startOfEndCalendar, "dddd D MMMM YYYY")}`,
          }),
        )
        .toHaveFocus();
      const startNavigation = [
        [/Previous Month/, `Previous Month, ${startMonthLabel}`],
        [/Month Dropdown/, undefined],
        [/Year Dropdown/, undefined],
        [/Next Month/, `Next Month, ${startMonthLabel}`],
      ] as const;
      for (const [label, exactLabel] of startNavigation) {
        await userEvent.tab();
        const control = page.getByLabelText(label).first();
        await expect.element(control).toHaveFocus();
        if (exactLabel) {
          await expect
            .element(control)
            .toHaveAttribute("aria-label", exactLabel);
        }
      }
      await userEvent.tab();
      await expect.element(selectedStart).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expectCalendarCount(0);
      await expect.element(startInput()).toHaveFocus();
      await userEvent.tab();
      await expect.element(endInput()).toHaveFocus();
      await userEvent.tab();
      await expect.element(calendarTrigger()).toHaveFocus();
      await userEvent.tab();
      await expect.element(calendarTrigger()).not.toHaveFocus();
    });

    it("SHOULD only be able to select a date between min/max", async () => {
      const selectionChange = vi.fn();
      await render(
        <RangeWithMinMaxDate
          defaultSelectedDate={initialRangeDate}
          onSelectionChange={selectionChange}
          selectionVariant="range"
        />,
      );
      await openCalendar();
      const beforeMin = page.getByRole("button", {
        name: "Monday 14 January 2030",
      });
      await expect.element(beforeMin).toHaveAttribute("aria-disabled", "true");
      await expect
        .element(page.getByLabelText(/Past dates are out of range/).first())
        .toHaveAttribute("aria-disabled", "true");
      const minStart = page.getByRole("button", {
        name: "Start new range: Tuesday 15 January 2030",
      });
      await expect.element(minStart).toHaveFocus();
      await beforeMin.click({ force: true });
      expect(selectionChange).not.toHaveBeenCalled();
      await page
        .getByRole("button", {
          name: "Tuesday 15 January 2030, minimum date",
        })
        .click();
      await page
        .getByRole("button", {
          name: "Wednesday 15 January 2031, maximum date",
        })
        .click();
      await expectCalendarCount(0);
      await expect.element(startInput()).toHaveValue("15 Jan 2030");
      await expect.element(endInput()).toHaveValue("15 Jan 2031");
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date.startDate, "DD MMM YYYY")).toBe("15 Jan 2030");
      expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe("15 Jan 2031");
      expect(details).toBeUndefined();
    });

    it("SHOULD enable the end calendar Next button before maxDate", async () => {
      const minDate = adapter.parse("15/01/2030", "DD/MM/YYYY").date;
      const maxDate = adapter.parse("15/12/2030", "DD/MM/YYYY").date;
      await render(
        <DatePicker
          selectionVariant="range"
          minDate={minDate}
          maxDate={maxDate}
        >
          <DatePickerTrigger>
            <DatePickerRangeInput />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerRangePanel
              defaultStartVisibleMonth={
                adapter.parse("01/01/2030", "DD/MM/YYYY").date
              }
              defaultEndVisibleMonth={
                adapter.parse("01/02/2030", "DD/MM/YYYY").date
              }
            />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await openCalendar();
      await expect
        .element(page.getByRole("button", { name: /^Next Month/ }).nth(1))
        .not.toHaveAttribute("aria-disabled", "true");
    });

    for (const boundary of ["min", "max"] as const) {
      it(`SHOULD clamp DatePickerRangePanel to ${boundary}Date for an out-of-range typed start date`, async () => {
        const visibleMonthChange = vi.fn();
        const minDate = adapter.parse("15/01/2030", "DD/MM/YYYY").date;
        const maxDate = adapter.parse("15/01/2031", "DD/MM/YYYY").date;
        await render(
          <DatePicker
            selectionVariant="range"
            enableApply
            minDate={minDate}
            maxDate={maxDate}
          >
            <DatePickerTrigger>
              <DatePickerRangeInput />
            </DatePickerTrigger>
            <DatePickerOverlay>
              <DatePickerRangePanel
                defaultStartVisibleMonth={
                  boundary === "min"
                    ? adapter.parse("01/06/2030", "DD/MM/YYYY").date
                    : undefined
                }
                onStartVisibleMonthChange={visibleMonthChange}
              >
                {boundary === "min" ? (
                  <DatePickerActions selectionVariant="range" />
                ) : undefined}
              </DatePickerRangePanel>
              {boundary === "max" ? (
                <DatePickerActions selectionVariant="range" />
              ) : undefined}
            </DatePickerOverlay>
          </DatePicker>,
        );
        await openCalendar();
        await replaceRangeInput(
          0,
          boundary === "min" ? "01 Jan 2020" : "01 Jan 2040",
        );
        await userEvent.tab();
        const expectedName =
          boundary === "min"
            ? "Tuesday 15 January 2030, minimum date"
            : "Wednesday 15 January 2031, maximum date";
        await expect
          .element(page.getByRole("button", { name: expectedName }))
          .toBeInTheDocument();
        const [, visibleMonth] = lastCall(visibleMonthChange);
        expect(adapter.format(visibleMonth, "DD MMM YYYY")).toBe(
          boundary === "min" ? "01 Jan 2030" : "01 Jan 2031",
        );
      });
    }

    it("SHOULD default to today's month when opening with no date set", async () => {
      await render(<Range />);
      await openCalendar();
      const today = page.getByRole("button", { name: "Monday 6 May 2024" });
      await expect.element(today).toBeInTheDocument();
      await expect.element(today).toHaveFocus();
    });

    it("SHOULD show no-date action labels", async () => {
      await render(
        <DatePicker selectionVariant="range" enableApply>
          <DatePickerTrigger>
            <DatePickerRangeInput />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerRangePanel />
            <DatePickerActions selectionVariant="range" />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await openCalendar();
      await expect
        .element(page.getByRole("button", { name: "Apply no date selected" }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Cancel no date selected" }))
        .toBeInTheDocument();
    });

    it("SHOULD show partial range action labels", async () => {
      await render(
        <DatePicker selectionVariant="range" enableApply>
          <DatePickerTrigger>
            <DatePickerRangeInput />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerRangePanel />
            <DatePickerActions selectionVariant="range" />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await openCalendar();
      await page.getByRole("button", { name: "Monday 6 May 2024" }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: /Apply Monday 6 May 2024 to no end date/,
          }),
        )
        .toBeInTheDocument();
    });

    for (const boundary of ["min", "max"] as const) {
      it(`SHOULD clamp DatePickerRangeGridPanel to ${boundary}Date for an out-of-range typed start date`, async () => {
        const visibleMonthChange = vi.fn();
        const minDate = adapter.parse("15/01/2030", "DD/MM/YYYY").date;
        const maxDate = adapter.parse("15/01/2031", "DD/MM/YYYY").date;
        await render(
          <DatePicker
            selectionVariant="range"
            enableApply
            minDate={minDate}
            maxDate={maxDate}
          >
            <DatePickerTrigger>
              <DatePickerRangeInput />
            </DatePickerTrigger>
            <DatePickerOverlay>
              <DatePickerRangeGridPanel
                defaultVisibleMonth={
                  boundary === "min"
                    ? adapter.parse("01/06/2030", "DD/MM/YYYY").date
                    : undefined
                }
                onVisibleMonthChange={visibleMonthChange}
              >
                <DatePickerActions selectionVariant="range" />
              </DatePickerRangeGridPanel>
            </DatePickerOverlay>
          </DatePicker>,
        );
        await openCalendar(1);
        await replaceRangeInput(
          0,
          boundary === "min" ? "01 Jan 2020" : "01 Jan 2040",
        );
        await userEvent.tab();
        const expectedName =
          boundary === "min"
            ? "Tuesday 15 January 2030, minimum date"
            : "Wednesday 15 January 2031, maximum date";
        await expect
          .element(page.getByRole("button", { name: expectedName }))
          .toBeInTheDocument();
        const [, visibleMonth] = lastCall(visibleMonthChange);
        expect(adapter.format(visibleMonth, "DD MMM YYYY")).toBe(
          boundary === "min" ? "01 Jan 2030" : "01 Jan 2031",
        );
      });
    }

    it("SHOULD support validation", async () => {
      const selectionChange = vi.fn();
      await render(
        <RangeWithFormField
          selectionVariant="range"
          onSelectionChange={selectionChange}
        />,
      );
      await replaceRangeInput(0, initialRangeDateValue.startDate);
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(1);
      let [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date.startDate, "DD MMM YYYY")).toBe("05 Jan 2025");
      expect(adapter.isValid(date.endDate)).toBe(false);
      expect(details).toEqual({
        startDate: { value: "05 Jan 2025" },
        endDate: {
          value: "",
          errors: [
            { type: DateDetailError.UNSET, message: "no end date defined" },
          ],
        },
      });
      await replaceRangeInput(1, initialRangeDateValue.endDate);
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(2);
      [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe("06 Jan 2025");
      expect(details).toEqual({
        startDate: { value: "05 Jan 2025" },
        endDate: { value: "06 Jan 2025" },
      });
      await replaceRangeInput(1, "bad date");
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(3);
      [, date, details] = lastCall(selectionChange);
      expect(adapter.isValid(date.endDate)).toBe(false);
      expect(details.endDate).toEqual({
        value: "bad date",
        errors: [
          { type: DateDetailError.INVALID_DATE, message: "not a valid date" },
        ],
      });
      await replaceRangeInput(0, initialRangeDateValue.startDate);
      await replaceRangeInput(1, initialRangeDateValue.endDate);
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(4);
      (startInput().element() as HTMLInputElement).focus();
      await userEvent.tab();
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(4);
    });

    it("SHOULD support clearing dates", async () => {
      const selectionChange = vi.fn();
      await render(
        <RangeWithFormField
          selectionVariant="range"
          onSelectionChange={selectionChange}
        />,
      );
      await replaceRangeInput(0, initialRangeDateValue.startDate);
      await replaceRangeInput(1, initialRangeDateValue.endDate);
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(2);
      await replaceRangeInput(0, "");
      await userEvent.tab();
      let [, date, details] = lastCall(selectionChange);
      expect(date.startDate).toBeNull();
      expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe("06 Jan 2025");
      expect(details.startDate.errors).toEqual([
        { type: DateDetailError.UNSET, message: "no start date defined" },
      ]);
      await replaceRangeInput(1, "");
      await userEvent.tab();
      [, date, details] = lastCall(selectionChange);
      expect(date.startDate).toBeNull();
      expect(date.endDate).toBeNull();
      expect(details.endDate.errors).toEqual([
        { type: DateDetailError.UNSET, message: "no end date defined" },
      ]);
    });

    it("SHOULD call custom validate for cleared/unset range values", async () => {
      const validate = vi.fn((_date, details) => details);
      await render(
        <DatePicker selectionVariant="range">
          <DatePickerTrigger>
            <DatePickerRangeInput validate={validate} />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerRangeGridPanel />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await replaceRangeInput(0, initialRangeDateValue.startDate);
      await replaceRangeInput(1, initialRangeDateValue.endDate);
      await userEvent.tab();
      await replaceRangeInput(0, "");
      await replaceRangeInput(1, "");
      await userEvent.tab();
      expect(validate).toHaveBeenCalled();
      expect(
        validate.mock.calls.some(([date]) => {
          return (
            !adapter.isValid(date?.startDate) && !adapter.isValid(date?.endDate)
          );
        }),
      ).toBe(true);
    });

    it("SHOULD render helper text in the panel when opened", async () => {
      await render(<RangeWithFormField />);
      const outsideHelper = () =>
        Array.from(
          document.querySelectorAll<HTMLElement>('[id^="helperText-"]'),
        ).find((element) => !element.closest("[data-floating-ui-portal]"));
      expect(outsideHelper()).toBeVisible();
      await openCalendar();
      expect(outsideHelper()).not.toBeVisible();
      const dialogHelper = Array.from(
        document.querySelectorAll<HTMLElement>('[id^="helperText-"]'),
      ).find((element) => element.closest('[role="dialog"]'));
      expect(dialogHelper).toBeVisible();
    });

    it("SHOULD support custom panel with tenors", async () => {
      const selectionChange = vi.fn();
      await render(
        <RangeWithCustomPanel
          selectionVariant="range"
          onSelectionChange={selectionChange}
        />,
      );
      await openCalendar();
      const tenor = page.getByRole("option", { name: "15 years" });
      await tenor.hover();
      await tenor.click();
      await expectCalendarCount(0);
      await userEvent.tab();
      const expectedStart = adapter.today();
      const expectedEnd = adapter.add(expectedStart, { years: 15 });
      const [, date] = lastCall(selectionChange);
      expect(adapter.format(date.startDate, "DD MMM YYYY")).toBe(
        adapter.format(expectedStart, "DD MMM YYYY"),
      );
      expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe(
        adapter.format(expectedEnd, "DD MMM YYYY"),
      );
    });

    describe("SHOULD support confirmation", () => {
      for (const action of ["Cancel", "Apply"] as const) {
        it(`SHOULD ${action.toLowerCase()} un-confirmed selections`, async () => {
          const selectionChange = vi.fn();
          const onApply = vi.fn();
          const onCancel = vi.fn();
          await render(
            <RangeWithConfirmation
              selectionVariant="range"
              defaultSelectedDate={initialRangeDate}
              onSelectionChange={selectionChange}
              onApply={onApply}
              onCancel={onCancel}
            />,
          );
          await openCalendar();
          await page
            .getByRole("button", { name: "Wednesday 15 January 2025" })
            .click();
          await page
            .getByRole("button", { name: "Thursday 16 January 2025" })
            .click();
          await expect.element(startInput()).toHaveValue("15 Jan 2025");
          await expect.element(endInput()).toHaveValue("16 Jan 2025");
          const actionName = `${action} Wednesday 15 January 2025 to Thursday 16 January 2025`;
          await page.getByRole("button", { name: actionName }).click();
          await expectCalendarCount(0);
          if (action === "Cancel") {
            expect(onApply).not.toHaveBeenCalled();
            expect(onCancel).toHaveBeenCalled();
            await expect.element(startInput()).toHaveValue("05 Jan 2025");
            await expect.element(endInput()).toHaveValue("06 Jan 2025");
          } else {
            expect(onCancel).not.toHaveBeenCalled();
            const [, date] = lastCall(onApply);
            expect(adapter.format(date.startDate, "DD MMM YYYY")).toBe(
              "15 Jan 2025",
            );
            expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe(
              "16 Jan 2025",
            );
          }
        });
      }
    });

    it("SHOULD support custom parsing", async () => {
      const selectionChange = vi.fn();
      await render(
        <RangeWithCustomParser
          onSelectionChange={selectionChange}
          defaultSelectedDate={initialRangeDate}
        />,
      );
      await replaceRangeInput(0, "+7");
      await userEvent.tab();
      const offsetStartDate = adapter.add(initialRangeDate.startDate, {
        days: 7,
      });
      await expect
        .element(startInput())
        .toHaveValue(adapter.format(offsetStartDate, "DD MMM YYYY"));
      await replaceRangeInput(1, "+7");
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(2);
      const offsetEndDate = adapter.add(initialRangeDate.endDate, { days: 7 });
      const [, date] = lastCall(selectionChange);
      expect(adapter.format(date.startDate, "DD MMM YYYY")).toBe(
        adapter.format(offsetStartDate, "DD MMM YYYY"),
      );
      expect(adapter.format(date.endDate, "DD MMM YYYY")).toBe(
        adapter.format(offsetEndDate, "DD MMM YYYY"),
      );
    });

    describe("timezone", () => {
      const systemStart = new Date(2025, 0, 5).toISOString();
      const systemEnd = new Date(2025, 0, 6).toISOString();
      const cases = [
        ["default", systemStart, systemEnd],
        ["system", systemStart, systemEnd],
        ["UTC", "2025-01-05T00:00:00.000Z", "2025-01-06T00:00:00.000Z"],
        [
          "America/New_York",
          "2025-01-05T05:00:00.000Z",
          "2025-01-06T05:00:00.000Z",
        ],
        [
          "Europe/London",
          "2025-01-05T00:00:00.000Z",
          "2025-01-06T00:00:00.000Z",
        ],
        [
          "Asia/Shanghai",
          "2025-01-04T16:00:00.000Z",
          "2025-01-05T16:00:00.000Z",
        ],
        [
          "Asia/Kolkata",
          "2025-01-04T18:30:00.000Z",
          "2025-01-05T18:30:00.000Z",
        ],
      ] as const;
      for (const [timezone, expectedStart, expectedEnd] of cases) {
        it(`SHOULD render date in the ${timezone} timezone`, async () => {
          await render(<RangeWithTimezone />);
          await chooseTimezone(timezone);
          await replaceRangeInput(0, initialRangeDateValue.startDate);
          await userEvent.tab();
          await replaceRangeInput(1, initialRangeDateValue.endDate);
          await userEvent.tab();
          await expect
            .element(page.getByTestId("iso-start-date-label"))
            .toHaveTextContent(expectedStart);
          await expect
            .element(page.getByTestId("iso-end-date-label"))
            .toHaveTextContent(expectedEnd);
        });
      }
    });

    it("SHOULD render the default range", async () => {
      await render(<Range defaultSelectedDate={initialRangeDate} />);
      await expect.element(startInput()).toHaveValue("05 Jan 2025");
      await expect.element(endInput()).toHaveValue("06 Jan 2025");
      await openCalendar();
      const selectedStart = page.getByRole("button", {
        name: `Start date: ${adapter.format(initialRangeDate.startDate, "dddd D MMMM YYYY")}, selected`,
      });
      await expect.element(selectedStart).toHaveFocus();
      await expect
        .element(
          page.getByRole("button", {
            name: "End range: Monday 6 January 2025, selected",
          }),
        )
        .toBeInTheDocument();
    });

    it("SHOULD not be able to select un-selectable dates", async () => {
      await render(
        <RangeWithUnselectableDates defaultSelectedDate={initialRangeDate} />,
      );
      await openCalendar();
      let currentDate = adapter.parse("01 Jan 2025", "DD MMM YYYY").date;
      const endDate = adapter.parse("31 Jan 2025", "DD MMM YYYY").date;
      while (adapter.compare(currentDate, endDate) <= 0) {
        let name = adapter.format(currentDate, "dddd D MMMM YYYY");
        if (adapter.isSame(currentDate, initialRangeDate.startDate, "day")) {
          name = `Start date: ${name}, selected`;
        } else if (
          adapter.isSame(currentDate, initialRangeDate.endDate, "day")
        ) {
          name = `End range: ${name}, selected`;
        }
        const day = page.getByRole("button", { name });
        if (isWeekend(adapter, currentDate)) {
          await expect.element(day).toHaveAttribute("aria-disabled", "true");
        } else {
          await expect
            .element(day)
            .not.toHaveAttribute("aria-disabled", "true");
        }
        currentDate = adapter.add(currentDate, { days: 1 });
      }
    });

    for (const controlled of [false, true]) {
      it(`SHOULD select a date in a ${controlled ? "controlled" : "uncontrolled"} range`, async () => {
        const Story = controlled ? RangeControlled : Range;
        await render(
          <Story
            selectionVariant="range"
            defaultSelectedDate={initialRangeDate}
          />,
        );
        await openCalendar();
        await page
          .getByRole("button", { name: "Wednesday 15 January 2025" })
          .click();
        await expect.element(endInput()).toHaveValue("");
        await page
          .getByRole("button", { name: "Thursday 16 January 2025" })
          .click();
        await expectCalendarCount(0);
        await expect.element(startInput()).toHaveValue("15 Jan 2025");
        await expect.element(endInput()).toHaveValue("16 Jan 2025");
      });
    }

    it("SHOULD support programmatic controlled range changes", async () => {
      await render(
        <RangeControlled
          selectionVariant="range"
          defaultSelectedDate={initialRangeDate}
        />,
      );
      await openCalendar();
      await page
        .getByRole("button", { name: "Wednesday 1 January 2025" })
        .click();
      await page
        .getByRole("button", { name: "Thursday 2 January 2025" })
        .click();
      await page.getByLabelText("set start date to today").click();
      await expect
        .element(startInput())
        .toHaveValue(adapter.format(adapter.today(), "DD MMM YYYY"));
      await page.getByLabelText("set end date to today").click();
      await expect
        .element(endInput())
        .toHaveValue(
          adapter.format(
            adapter.add(adapter.today(), { days: 1 }),
            "DD MMM YYYY",
          ),
        );
      await page.getByLabelText("reset start date").click();
      await expect.element(startInput()).toHaveValue("");
      await page.getByLabelText("reset end date").click();
      await expect.element(endInput()).toHaveValue("");
    });

    it("SHOULD preserve original time during date selection", async () => {
      const selectionChange = vi.fn();
      await render(
        <DatePicker
          defaultSelectedDate={{
            startDate: adapter.parse(
              "11 Dec 2024 00:09:30",
              "DD MMM YYYY HH:mm:ss",
            ).date,
            endDate: adapter.parse(
              "11 Dec 2024 00:10:33",
              "DD MMM YYYY HH:mm:ss",
            ).date,
          }}
          selectionVariant="range"
          onSelectionChange={selectionChange}
        >
          <DatePickerRangeInput />
          <DatePickerOverlay>
            <DatePickerRangePanel />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await replaceRangeInput(0, initialRangeDateValue.startDate);
      await userEvent.tab();
      await replaceRangeInput(1, initialRangeDateValue.endDate);
      await userEvent.tab();
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date.startDate, "DD MMM YYYY HH:mm:ss")).toBe(
        "05 Jan 2025 00:09:30",
      );
      expect(adapter.format(date.endDate, "DD MMM YYYY HH:mm:ss")).toBe(
        "06 Jan 2025 00:10:33",
      );
      expect(details).toEqual({
        startDate: { value: "05 Jan 2025" },
        endDate: { value: "06 Jan 2025" },
      });
    });

    it("SHOULD support format prop on the input", async () => {
      await render(
        <RangeCustomFormat
          format="YYYY-MM-DD"
          defaultSelectedDate={initialRangeDate}
        />,
      );
      await expect.element(startInput()).toHaveValue("2025-01-05");
      await expect.element(endInput()).toHaveValue("2025-01-06");
    });

    it("SHOULD have accessible names via aria-labelledby in a FormField", async () => {
      await render(
        <FormField>
          <FormFieldLabel>Select a date range</FormFieldLabel>
          <DatePicker
            selectionVariant="range"
            defaultSelectedDate={initialRangeDate}
          >
            <DatePickerRangeInput />
            <DatePickerOverlay>
              <DatePickerRangePanel />
            </DatePickerOverlay>
          </DatePicker>
        </FormField>,
      );
      expect(startInput().element().getAttribute("aria-labelledby")).toMatch(
        /\S/,
      );
      expect(endInput().element().getAttribute("aria-labelledby")).toMatch(
        /\S/,
      );
    });

    it("SHOULD provide unique accessible names for navigation pairs", async () => {
      await render(<Range defaultSelectedDate={initialRangeDate} />);
      await startInput().click();
      await userEvent.keyboard("{ArrowDown}");
      await expectCalendarCount(2);
      for (const label of [/Previous Month, /, /Next Month, /]) {
        const controls = await page.getByLabelText(label).elements();
        expect(controls).toHaveLength(2);
        expect(controls[0].getAttribute("aria-label")).not.toBe(
          controls[1].getAttribute("aria-label"),
        );
      }
    });
  });
}

describe("GIVEN a DatePicker where selectionVariant is range", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
