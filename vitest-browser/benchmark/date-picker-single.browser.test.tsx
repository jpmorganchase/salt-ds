import { FormField, FormFieldLabel } from "@salt-ds/core";
import { DateDetailError, type SaltDateAdapter } from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  DatePicker,
  DatePickerActions,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import type { Dayjs } from "dayjs";
import type { DateTime } from "luxon";
import MockDate from "mockdate";
import type { Moment } from "moment";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as datePickerStories from "~stories/date-picker/date-picker.stories";
import { renderWithSalt } from "../render";

const {
  ControlledOpen,
  Single,
  SingleControlled,
  SingleWithConfirmation,
  SingleWithCustomPanel,
  SingleWithCustomParser,
  SingleWithFormField,
  SingleWithMinMaxDate,
  SingleWithTodayButton,
  SingleWithUnselectableDates,
  SingleCustomFormat,
  SingleWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: Storybook story type
} = datePickerStories as any;

function textInput() {
  const element = document.querySelector<HTMLInputElement>(
    ".saltDatePickerSingleInput input",
  );
  if (!element) throw new Error("Date picker input was not rendered");
  return page.elementLocator(element);
}

async function replaceInput(value: string) {
  const input = textInput();
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

async function openCalendar() {
  await calendarTrigger().click();
  await expect.element(page.getByRole("application")).toBeInTheDocument();
}

async function expectCalendarClosed() {
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

function registerAdapterTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(new Date(2024, 4, 6)));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapter });
    const initialDateValue = "05 Jan 2025";
    const initialDate = adapter.parse(initialDateValue, "DD MMM YYYY").date;
    const updatedFormattedDateValue = "06 Jan 2025";
    const updatedDate = adapter.parse(
      updatedFormattedDateValue,
      "DD MMM YYYY",
    ).date;

    describe("WHEN default state", () => {
      it("SHOULD show calendar overlay when click the calendar icon button", async () => {
        await render(<Single />);
        const trigger = calendarTrigger();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.click();
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        const dialog = page.getByRole("dialog").element() as HTMLElement;
        expect(dialog.style.position).toBe("absolute");
        expect(dialog.style.top).toMatch(/^-?\d+(?:\.\d+)?px$/);
        expect(dialog.style.left).toMatch(/^-?\d+(?:\.\d+)?px$/);
        await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      });

      it("SHOULD open calendar overlay when using down arrow", async () => {
        await render(<Single />);
        const trigger = calendarTrigger();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      });

      it("SHOULD be able to enable the overlay to open on click", async () => {
        await render(<Single openOnClick />);
        await expectCalendarClosed();
        await textInput().click();
        await expect.element(page.getByRole("application")).toBeInTheDocument();
      });

      it("SHOULD NOT be able to enable the overlay to open on click, if disabled", async () => {
        await render(<Single openOnClick disabled />);
        await textInput().click({ force: true });
        await expectCalendarClosed();
      });

      it("SHOULD hide calendar upon focus out", async () => {
        await render(<Single />);
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        await textInput().click();
        await userEvent.tab();
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        pressOutside();
        await expectCalendarClosed();
      });

      it("SHOULD dismiss the calendar on an outside press", async () => {
        await render(<Single defaultOpen />);
        await expect.element(page.getByRole("application")).toBeInTheDocument();
        pressOutside();
        await expectCalendarClosed();
      });

      it("SHOULD be able to control the overlay open state", async () => {
        await render(<ControlledOpen />);
        await expectCalendarClosed();
        await textInput().click();
        await expectCalendarClosed();
        await openCalendar();
        await page
          .getByRole("button", { name: "Cancel no date selected" })
          .click();
        await expectCalendarClosed();
        await openCalendar();
        await page
          .getByRole("button", { name: "Apply no date selected" })
          .click();
        await expectCalendarClosed();
      });
    });

    describe("WHEN readOnly", () => {
      it("SHOULD not show calendar icon button", async () => {
        await render(<Single readOnly />);
        await expect
          .element(page.getByRole("button", { name: "Open Calendar" }))
          .not.toBeInTheDocument();
      });

      it("SHOULD not open overlay when using down arrow", async () => {
        await render(<Single readOnly />);
        await textInput().click();
        await userEvent.keyboard("{ArrowDown}");
        await expectCalendarClosed();
      });

      it("SHOULD not open overlay if defaultOpen is set", async () => {
        await render(<Single readOnly defaultOpen />);
        await expectCalendarClosed();
      });
    });

    it("SHOULD disable calendar button and input WHEN disabled", async () => {
      await render(<Single disabled />);
      await expect
        .element(page.getByRole("button", { name: "Open Calendar" }))
        .toBeDisabled();
      await expect.element(textInput()).toBeDisabled();
    });

    it("SHOULD be able to tab between all elements", async () => {
      await render(<Single defaultSelectedDate={initialDate} />);
      await textInput().click();
      await userEvent.keyboard("{ArrowDown}");
      const selectedDay = page.getByRole("button", {
        name: `${adapter.format(initialDate, "dddd D MMMM YYYY")}, selected`,
      });
      await expect.element(selectedDay).toHaveFocus();
      for (const label of [
        "Previous Month",
        "Month Dropdown",
        "Year Dropdown",
        "Next Month",
      ]) {
        await userEvent.tab();
        await expect.element(page.getByLabelText(label)).toHaveFocus();
      }
      await userEvent.tab();
      await expect.element(selectedDay).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expectCalendarClosed();
      await expect.element(textInput()).toHaveFocus();
      await userEvent.tab();
      const trigger = page.getByLabelText("Open Calendar");
      await expect.element(trigger).toHaveFocus();
      await userEvent.tab();
      await expect.element(trigger).not.toHaveFocus();
    });

    it("SHOULD support validation", async () => {
      const selectionChange = vi.fn();
      await render(<SingleWithFormField onSelectionChange={selectionChange} />);
      const cases = [
        {
          value: initialDateValue,
          valid: true,
          details: { value: initialDateValue },
        },
        {
          value: "bad date",
          valid: false,
          details: {
            value: "bad date",
            errors: [
              {
                type: DateDetailError.INVALID_DATE,
                message: "not a valid date",
              },
            ],
          },
        },
        {
          value: "another bad date 2",
          valid: false,
          details: {
            value: "another bad date 2",
            errors: [
              {
                type: DateDetailError.INVALID_DATE,
                message: "not a valid date",
              },
            ],
          },
        },
        {
          value: updatedFormattedDateValue,
          valid: true,
          details: { value: updatedFormattedDateValue },
        },
      ];
      for (const [index, testCase] of cases.entries()) {
        await replaceInput(testCase.value);
        await userEvent.tab();
        expect(selectionChange).toHaveBeenCalledTimes(index + 1);
        const [, date, details] = lastCall(selectionChange);
        expect(adapter.isValid(date)).toBe(testCase.valid);
        if (testCase.valid) {
          expect(adapter.format(date, "DD MMM YYYY")).toBe(testCase.value);
        }
        expect(details).toEqual(testCase.details);
      }
      (textInput().element() as HTMLInputElement).focus();
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(4);
      await expect.element(textInput()).toHaveValue(updatedFormattedDateValue);
    });

    it("SHOULD call custom validate for null/unset values", async () => {
      const validate = vi.fn((date, details) => {
        if (!date) {
          details.errors = [
            { type: "custom-unset", message: "custom empty message" },
          ];
        }
        return details;
      });
      await render(
        <DatePicker selectionVariant="single">
          <DatePickerTrigger>
            <DatePickerSingleInput validate={validate} />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await replaceInput(initialDateValue);
      await userEvent.tab();
      await replaceInput("");
      await userEvent.tab();
      expect(validate).toHaveBeenCalledTimes(2);
      expect(adapter.isValid(validate.mock.calls[0][0])).toBe(true);
      expect(validate.mock.calls[1][0]).toBe(null);
    });

    it("SHOULD only be able to select a date between min/max", async () => {
      const selectionChange = vi.fn();
      await render(
        <SingleWithMinMaxDate
          defaultSelectedDate={initialDate}
          onSelectionChange={selectionChange}
        />,
      );
      await openCalendar();
      await expect
        .element(page.getByLabelText("Past dates are out of range"))
        .toHaveAttribute("aria-disabled", "true");
      await expect
        .element(page.getByLabelText("Next Month"))
        .not.toHaveAttribute("aria-disabled", "true");
      const minDay = page.getByRole("button", {
        name: "Tuesday 15 January 2030",
      });
      await expect.element(minDay).toHaveFocus();
      await expect
        .element(page.getByRole("button", { name: "Monday 14 January 2030" }))
        .toHaveAttribute("aria-disabled", "true");
      await expect.element(minDay).not.toHaveAttribute("aria-disabled", "true");
      await page.getByRole("combobox", { name: "Year Dropdown" }).click();
      const year = page.getByRole("option", { name: "2031" });
      await year.hover();
      await year.click();
      await expect
        .element(page.getByLabelText("Future dates are out of range"))
        .toHaveAttribute("aria-disabled", "true");
      const maxDay = page.getByRole("button", {
        name: "Wednesday 15 January 2031",
      });
      const beyondMax = page.getByRole("button", {
        name: "Thursday 16 January 2031",
      });
      await expect.element(maxDay).not.toHaveAttribute("aria-disabled", "true");
      await expect.element(beyondMax).toHaveAttribute("aria-disabled", "true");
      await beyondMax.click({ force: true });
      expect(selectionChange).not.toHaveBeenCalled();
      await maxDay.click();
      await expectCalendarClosed();
      await expect.element(textInput()).toHaveValue("15 Jan 2031");
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date, "DD MMM YYYY")).toBe("15 Jan 2031");
      expect(details).toBeUndefined();
    });

    for (const boundary of ["min", "max"] as const) {
      it(`SHOULD navigate to ${boundary}Date month and call onVisibleMonthChange for an out-of-range typed date`, async () => {
        const visibleMonthChange = vi.fn();
        const minDate = adapter.parse("15/01/2030", "DD/MM/YYYY").date;
        const maxDate = adapter.parse("15/01/2031", "DD/MM/YYYY").date;
        const defaultVisibleMonth = adapter.parse(
          "01/06/2030",
          "DD/MM/YYYY",
        ).date;
        await render(
          <DatePicker
            selectionVariant="single"
            enableApply
            minDate={minDate}
            maxDate={maxDate}
          >
            <DatePickerTrigger>
              <DatePickerSingleInput />
            </DatePickerTrigger>
            <DatePickerOverlay>
              <DatePickerSingleGridPanel
                defaultVisibleMonth={
                  boundary === "min" ? defaultVisibleMonth : undefined
                }
                onVisibleMonthChange={visibleMonthChange}
              >
                <DatePickerActions selectionVariant="single" />
              </DatePickerSingleGridPanel>
            </DatePickerOverlay>
          </DatePicker>,
        );
        await openCalendar();
        await replaceInput(boundary === "min" ? "01 Jan 2020" : "01 Jan 2040");
        await userEvent.tab();
        const expected =
          boundary === "min"
            ? "Tuesday 15 January 2030"
            : "Wednesday 15 January 2031";
        await expect
          .element(page.getByRole("button", { name: expected }))
          .toBeInTheDocument();
        const disabledNavigation =
          boundary === "min"
            ? "Past dates are out of range"
            : "Future dates are out of range";
        await expect
          .element(page.getByLabelText(disabledNavigation))
          .toHaveAttribute("aria-disabled", "true");
        expect(visibleMonthChange).toHaveBeenCalled();
        const [, visibleMonth] = lastCall(visibleMonthChange);
        expect(adapter.format(visibleMonth, "DD MMM YYYY")).toBe(
          boundary === "min" ? "01 Jan 2030" : "01 Jan 2031",
        );
      });
    }

    it("SHOULD default to today's month when opening with no date set", async () => {
      await render(<Single />);
      await openCalendar();
      const today = page.getByRole("button", { name: "Monday 6 May 2024" });
      await expect.element(today).toBeInTheDocument();
      await expect.element(today).toHaveFocus();
    });

    it("SHOULD render helper text in the panel when opened", async () => {
      await render(<SingleWithFormField />);
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
        <SingleWithCustomPanel onSelectionChange={selectionChange} />,
      );
      await openCalendar();
      const tenor = page.getByRole("option", { name: "15 years" });
      await tenor.hover();
      await tenor.click();
      await expectCalendarClosed();
      await userEvent.tab();
      const futureDate = adapter.add(adapter.today(), { years: 15 });
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date, "DD MMM YYYY")).toBe(
        adapter.format(futureDate, "DD MMM YYYY"),
      );
      expect(details).toBeUndefined();
      await expect
        .element(textInput())
        .toHaveValue(adapter.format(futureDate, "DD MMM YYYY"));
    });

    it("SHOULD support custom panel with Today button", async () => {
      const selectionChange = vi.fn();
      await render(
        <SingleWithTodayButton onSelectionChange={selectionChange} />,
      );
      await openCalendar();
      await page.getByRole("button", { name: "Select Today" }).click();
      await expectCalendarClosed();
      await userEvent.tab();
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date, "DD MMM YYYY")).toBe(
        adapter.format(adapter.today(), "DD MMM YYYY"),
      );
      expect(details).toBeUndefined();
    });

    describe("SHOULD support confirmation", () => {
      for (const action of ["Cancel", "Apply"] as const) {
        it(`SHOULD ${action.toLowerCase()} un-confirmed selections`, async () => {
          const selectionChange = vi.fn();
          const onApply = vi.fn();
          const onCancel = vi.fn();
          await render(
            <SingleWithConfirmation
              defaultSelectedDate={initialDate}
              onSelectionChange={selectionChange}
              onApply={onApply}
              onCancel={onCancel}
            />,
          );
          await expect.element(textInput()).toHaveValue(initialDateValue);
          await openCalendar();
          await page
            .getByRole("button", {
              name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
            })
            .click();
          await expect
            .element(textInput())
            .toHaveValue(updatedFormattedDateValue);
          const [, selected] = lastCall(selectionChange);
          expect(adapter.format(selected, "DD MMM YYYY")).toBe(
            updatedFormattedDateValue,
          );
          await page
            .getByRole("button", {
              name: `${action} Monday 6 January 2025`,
            })
            .click();
          await expectCalendarClosed();
          if (action === "Cancel") {
            expect(onApply).not.toHaveBeenCalled();
            expect(onCancel).toHaveBeenCalled();
            await expect.element(textInput()).toHaveValue(initialDateValue);
          } else {
            const [, applied] = lastCall(onApply);
            expect(adapter.format(applied, "DD MMM YYYY")).toBe(
              updatedFormattedDateValue,
            );
            await expect
              .element(textInput())
              .toHaveValue(updatedFormattedDateValue);
          }
        });
      }
    });

    it("SHOULD support custom parsing", async () => {
      const selectionChange = vi.fn();
      await render(
        <SingleWithCustomParser onSelectionChange={selectionChange} />,
      );
      await replaceInput(initialDateValue);
      await userEvent.tab();
      expect(adapter.format(lastCall(selectionChange)[1], "DD MMM YYYY")).toBe(
        initialDateValue,
      );
      await replaceInput("+7");
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(2);
      const futureDate = adapter.add(initialDate, { days: 7 });
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date, "DD MMM YYYY")).toBe(
        adapter.format(futureDate, "DD MMM YYYY"),
      );
      expect(details).toEqual({ value: "+7" });
      await expect
        .element(textInput())
        .toHaveValue(adapter.format(futureDate, "DD MMM YYYY"));
    });

    describe("timezone", () => {
      const systemExpectedResult = new Date(2025, 0, 5).toISOString();
      const cases = [
        ["default", systemExpectedResult],
        ["system", systemExpectedResult],
        ["UTC", "2025-01-05T00:00:00.000Z"],
        ["America/New_York", "2025-01-05T05:00:00.000Z"],
        ["Europe/London", "2025-01-05T00:00:00.000Z"],
        ["Asia/Shanghai", "2025-01-04T16:00:00.000Z"],
        ["Asia/Kolkata", "2025-01-04T18:30:00.000Z"],
      ] as const;
      for (const [timezone, expectedResult] of cases) {
        it(`SHOULD render date in the ${timezone} timezone`, async () => {
          await render(<SingleWithTimezone />);
          await chooseTimezone(timezone);
          await replaceInput(initialDateValue);
          await userEvent.tab();
          await expect
            .element(page.getByTestId("iso-date-label"))
            .toHaveTextContent(expectedResult);
        });
      }
    });

    for (const controlled of [false, true]) {
      it(`SHOULD render the ${controlled ? "selected" : "default"} date in a ${controlled ? "controlled" : "uncontrolled"} component`, async () => {
        const Story = controlled ? SingleControlled : Single;
        await render(<Story defaultSelectedDate={initialDate} />);
        await expect.element(textInput()).toHaveValue(initialDateValue);
        await openCalendar();
        const selected = page.getByRole("button", {
          name: `${adapter.format(initialDate, "dddd D MMMM YYYY")}, selected`,
        });
        await expect.element(selected).toBeInTheDocument();
        await expect.element(selected).toHaveFocus();
      });

      it(`SHOULD be able to select a date in a ${controlled ? "controlled" : "uncontrolled"} component`, async () => {
        const Story = controlled ? SingleControlled : Single;
        await render(<Story defaultSelectedDate={initialDate} />);
        await openCalendar();
        await page
          .getByRole("button", {
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
          })
          .click();
        await expectCalendarClosed();
        await expect
          .element(textInput())
          .toHaveValue(updatedFormattedDateValue);

        if (controlled) {
          await page.getByLabelText("today").click();
          await expect
            .element(textInput())
            .toHaveValue(adapter.format(adapter.today(), "DD MMMM YYYY"));
          await page.getByLabelText("reset").click();
          await expect.element(textInput()).toHaveValue("");
        }
      });
    }

    it("SHOULD not be able to select un-selectable dates", async () => {
      await render(
        <SingleWithUnselectableDates defaultSelectedDate={initialDate} />,
      );
      await openCalendar();
      let currentDate = adapter.parse("01 Jan 2025", "DD MMM YYYY").date;
      const endDate = adapter.parse("31 Jan 2025", "DD MMM YYYY").date;
      while (adapter.compare(currentDate, endDate) <= 0) {
        const name = adapter.isSame(initialDate, currentDate, "day")
          ? `${adapter.format(currentDate, "dddd D MMMM YYYY")}, selected`
          : adapter.format(currentDate, "dddd D MMMM YYYY");
        let dayOfWeek: number;
        if (adapter.lib === "luxon")
          dayOfWeek = (currentDate as DateTime).weekday;
        else if (adapter.lib === "moment")
          dayOfWeek = (currentDate as Moment).day();
        else if (adapter.lib === "dayjs")
          dayOfWeek = (currentDate as Dayjs).day();
        else dayOfWeek = (currentDate as Date).getDay();
        const weekend =
          adapter.lib === "luxon"
            ? dayOfWeek === 6 || dayOfWeek === 7
            : dayOfWeek === 0 || dayOfWeek === 6;
        const day = page.getByRole("button", { name });
        if (weekend) {
          await expect.element(day).toHaveAttribute("aria-disabled", "true");
        } else {
          await expect
            .element(day)
            .not.toHaveAttribute("aria-disabled", "true");
        }
        currentDate = adapter.add(currentDate, { days: 1 });
      }
    });

    it("SHOULD NOT auto-apply typed unselectable dates without DatePickerActions", async () => {
      const onApply = vi.fn();
      const selectionChange = vi.fn();
      const blockedDate = adapter.parse("04 Jan 2025", "DD MMM YYYY").date;
      await render(
        <DatePicker
          selectionVariant="single"
          isDayUnselectable={(day) =>
            adapter.isSame(day, blockedDate, "day") ? "blocked date" : false
          }
          onSelectionChange={selectionChange}
          onApply={onApply}
        >
          <DatePickerTrigger>
            <DatePickerSingleInput />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await replaceInput("04 Jan 2025");
      await userEvent.tab();
      expect(selectionChange).toHaveBeenCalledTimes(1);
      expect(lastCall(selectionChange)[2]?.errors).toEqual([
        { type: "unselectable", message: "blocked date" },
      ]);
      expect(onApply).not.toHaveBeenCalled();
    });

    it("SHOULD preserve original time during date selection", async () => {
      const selectionChange = vi.fn();
      const defaultSelectedDate = adapter.date("2024-12-11T00:09:30Z", "UTC");
      await render(
        <DatePicker
          defaultSelectedDate={defaultSelectedDate}
          selectionVariant="single"
          onSelectionChange={selectionChange}
        >
          <DatePickerSingleInput />
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>,
      );
      await replaceInput(initialDateValue);
      await userEvent.tab();
      const [, date, details] = lastCall(selectionChange);
      expect(adapter.format(date, "DD MMM YYYY HH:mm:ss")).toBe(
        "05 Jan 2025 00:09:30",
      );
      expect(details).toEqual({ value: initialDateValue });
    });

    it("SHOULD support format prop on the input", async () => {
      await render(
        <SingleCustomFormat
          format="YYYY-MM-DD"
          defaultSelectedDate={initialDate}
        />,
      );
      await expect.element(textInput()).toHaveValue("2025-01-05");
    });

    it("SHOULD have accessible name via aria-labelledby in a FormField", async () => {
      await render(
        <FormField>
          <FormFieldLabel>Select a date</FormFieldLabel>
          <DatePicker
            defaultSelectedDate={initialDate}
            selectionVariant="single"
          >
            <DatePickerSingleInput />
            <DatePickerOverlay>
              <DatePickerSingleGridPanel />
            </DatePickerOverlay>
          </DatePicker>
        </FormField>,
      );
      await expect.element(textInput()).toHaveAttribute("aria-labelledby");
    });
  });
}

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
