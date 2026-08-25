import type { SaltDateAdapter } from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
} from "@salt-ds/date-components";
import MockDate from "mockdate";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as calendarStories from "~stories/calendar/calendar.stories";
import "moment/dist/locale/es";
import { renderWithSalt } from "~browser-test-utils/render";

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

const {
  CustomDayRendering,
  TodayButton,
  TwinCalendars,
  UnselectableDates,
  WithLocale,
  // biome-ignore lint/suspicious/noExplicitAny: Storybook story type
} = calendarStories as any;

function lastCall(spy: ReturnType<typeof vi.fn>) {
  const call = spy.mock.calls.at(-1);
  if (!call) throw new Error("Expected callback to have been called");
  return call;
}

function focus(locator: ReturnType<typeof page.getByRole>) {
  (locator.element() as HTMLElement).focus();
}

async function expectFocusedDay(locator: ReturnType<typeof page.getByRole>) {
  await expect.element(locator).toHaveFocus();
  await expect.element(locator).toHaveClass(/saltCalendarDay-focused/);
}

async function expectTooltipContent(
  locator: ReturnType<typeof page.getByRole>,
  content: string,
) {
  await expect
    .poll(() => {
      const describedBy = locator.element().getAttribute("aria-describedby");
      return describedBy
        ? document
            .getElementById(describedBy)
            ?.querySelector(".saltTooltip-content")
            ?.textContent?.trim()
        : null;
    })
    .toBe(content);
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
    const testDate = adapter.parse("02/03/2024", "DD/MM/YYYY").date;
    const basicCalendar = (props: Record<string, unknown> = {}) => (
      <Calendar
        selectionVariant="single"
        defaultVisibleMonth={testDate}
        {...props}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    );

    it("SHOULD set aria-current=date on today's date", async () => {
      await render(
        <Calendar selectionVariant="single">
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const today = adapter.today();
      await expect
        .element(page.getByRole("application"))
        .toHaveAccessibleName(adapter.format(today, "MMMM YYYY"));
      await expect
        .element(
          page.getByRole("button", {
            name: adapter.format(today, "dddd D MMMM YYYY"),
          }),
        )
        .toHaveAttribute("aria-current", "date");
    });

    for (const direction of ["Previous", "Next"] as const) {
      it(`SHOULD navigate to the ${direction.toLowerCase()} month with the button`, async () => {
        await render(basicCalendar());
        await page.getByRole("button", { name: `${direction} Month` }).click();
        const expected =
          direction === "Previous"
            ? adapter.subtract(testDate, { months: 1 })
            : adapter.add(testDate, { months: 1 });
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(expected, "dddd D MMMM YYYY"),
            }),
          )
          .toBeVisible();
      });
    }

    it("SHOULD navigate with the month dropdown", async () => {
      await render(basicCalendar());
      const dropdown = page.getByRole("combobox", { name: "Month Dropdown" });
      await expect
        .element(dropdown)
        .toHaveTextContent(adapter.format(testDate, "MMM"));
      await dropdown.click();
      const nextMonth = adapter.add(testDate, { months: 4 });
      const option = page.getByRole("option", {
        name: adapter.format(nextMonth, "MMMM"),
      });
      await option.hover();
      await option.click();
      await expect
        .element(dropdown)
        .toHaveTextContent(adapter.format(nextMonth, "MMM"));
      await expect
        .element(
          page.getByRole("button", {
            name: adapter.format(nextMonth, "dddd D MMMM YYYY"),
          }),
        )
        .toBeVisible();
    });

    it("SHOULD navigate with the year dropdown", async () => {
      await render(basicCalendar());
      const dropdown = page.getByRole("combobox", { name: "Year Dropdown" });
      await expect
        .element(dropdown)
        .toHaveTextContent(adapter.format(testDate, "YYYY"));
      await dropdown.click();
      const nextYear = adapter.add(testDate, { years: 1 });
      const option = page.getByRole("option", {
        name: adapter.format(nextYear, "YYYY"),
      });
      await option.hover();
      await option.click();
      await expect
        .element(dropdown)
        .toHaveTextContent(adapter.format(nextYear, "YYYY"));
      await expect
        .element(
          page.getByRole("button", {
            name: adapter.format(nextYear, "dddd D MMMM YYYY"),
          }),
        )
        .toBeVisible();
    });

    it("SHOULD navigate when clicking an out-of-range date", async () => {
      await render(basicCalendar());
      let nextMonth = adapter.endOf(testDate, "month");
      nextMonth = adapter.add(nextMonth, { days: 1 });
      await page
        .getByRole("button", {
          name: adapter.format(nextMonth, "dddd D MMMM YYYY"),
        })
        .click();
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(nextMonth, "MMM"));
    });

    it("SHOULD move focus with arrow keys", async () => {
      await render(basicCalendar());
      let date = testDate;
      let day = page.getByRole("button", {
        name: adapter.format(date, "dddd D MMMM YYYY"),
      });
      focus(day);
      await expectFocusedDay(day);
      for (const [key, amount] of [
        ["ArrowRight", { days: 1 }],
        ["ArrowLeft", { days: -1 }],
        ["ArrowDown", { weeks: 1 }],
        ["ArrowUp", { weeks: -1 }],
      ] as const) {
        await userEvent.keyboard(`{${key}}`);
        date =
          "days" in amount
            ? adapter.add(date, { days: amount.days })
            : adapter.add(date, { weeks: amount.weeks });
        day = page.getByRole("button", {
          name: adapter.format(date, "dddd D MMMM YYYY"),
        });
        await expectFocusedDay(day);
      }
    });

    const shortcuts = [
      ["HOME", "{Home}", adapter.startOf(testDate, "week")],
      ["END", "{End}", adapter.endOf(testDate, "week")],
      ["PageUp", "{PageUp}", adapter.subtract(testDate, { months: 1 })],
      ["PageDown", "{PageDown}", adapter.add(testDate, { months: 1 })],
      [
        "Shift PageUp",
        "{Shift>}{PageUp}{/Shift}",
        adapter.subtract(testDate, { years: 1 }),
      ],
      [
        "Shift PageDown",
        "{Shift>}{PageDown}{/Shift}",
        adapter.add(testDate, { years: 1 }),
      ],
    ] as const;
    for (const [name, keys, expectedDate] of shortcuts) {
      it(`SHOULD move focus with ${name}`, async () => {
        await render(basicCalendar());
        focus(
          page.getByRole("button", {
            name: adapter.format(testDate, "dddd D MMMM YYYY"),
          }),
        );
        await userEvent.keyboard(keys);
        await expectFocusedDay(
          page.getByRole("button", {
            name: adapter.format(expectedDate, "dddd D MMMM YYYY"),
          }),
        );
      });
    }

    it("SHOULD hide year dropdown on navigation", async () => {
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
          <CalendarNavigation hideYearDropdown />
          <CalendarGrid />
        </Calendar>,
      );
      await expect
        .element(page.getByRole("combobox", { name: "Year Dropdown" }))
        .not.toBeInTheDocument();
      const month = page.getByRole("combobox", { name: "Month Dropdown" });
      await month.click();
      const nextQuarter = adapter.add(testDate, { months: 4 });
      const option = page.getByRole("option", {
        name: adapter.format(nextQuarter, "MMMM"),
      });
      await option.hover();
      await option.click();
      await expect
        .element(month)
        .toHaveTextContent(adapter.format(nextQuarter, "MMM"));
    });

    it("SHOULD render custom headers", async () => {
      await render(<TodayButton defaultVisibleMonth={testDate} />);
      const today = adapter.today();
      await page
        .getByRole("button", {
          name: `Change Date, ${adapter.format(today, "dddd DD MMMM YYYY")}`,
        })
        .click();
      await expect
        .element(
          page.getByRole("button", {
            name: adapter.format(today, "dddd D MMMM YYYY"),
          }),
        )
        .toHaveAttribute("aria-current", "date");
    });

    it("SHOULD render custom day", async () => {
      await render(<CustomDayRendering defaultVisibleMonth={testDate} />);
      const button = Array.from(document.querySelectorAll("button")).find(
        (element) => element.textContent?.trim() === "1",
      );
      expect(button).toBeDefined();
      expect(button?.querySelector("span.dot")).toBeInTheDocument();
    });

    it("SHOULD support multi-calendar selection", async () => {
      const endDate = adapter.add(testDate, { months: 1 });
      await render(
        <TwinCalendars
          selectionVariant="range"
          defaultVisibleMonth={testDate}
          defaultSelectedDate={{ startDate: testDate, endDate }}
        />,
      );
      for (const name of [
        `Start new range: ${adapter.format(adapter.startOf(testDate, "month"), "dddd D MMMM YYYY")}`,
        `Start date: ${adapter.format(testDate, "dddd D MMMM YYYY")}, selected`,
        `End range: ${adapter.format(endDate, "dddd D MMMM YYYY")}, selected`,
        adapter.format(adapter.endOf(endDate, "month"), "dddd D MMMM YYYY"),
      ]) {
        await expect
          .element(page.getByRole("button", { name }))
          .toBeInTheDocument();
      }
    });

    it("SHOULD render different locales", async () => {
      const visibleMonth = adapter.parse("01/08/2024", "DD/MM/YYYY").date;
      await render(<WithLocale defaultVisibleMonth={visibleMonth} />);
      const dropdown = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Month Dropdown"]',
      );
      if (!dropdown) throw new Error("Month dropdown was not rendered");
      await expect
        .element(page.elementLocator(dropdown))
        .toHaveTextContent("ago");
    });

    it("SHOULD be selectable between min/max dates", async () => {
      const startOfMonth = adapter.startOf(testDate, "month");
      const endOfMonth = adapter.endOf(testDate, "month");
      const minDate = adapter.add(startOfMonth, { days: 1 });
      const maxDate = adapter.subtract(endOfMonth, { days: 1 });
      await render(
        <Calendar
          selectionVariant="single"
          defaultVisibleMonth={startOfMonth}
          minDate={minDate}
          maxDate={maxDate}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page.getByRole("combobox", { name: "Month Dropdown" }).click();
      for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
        const month = adapter.set(adapter.clone(testDate), {
          month: monthIndex,
        });
        const option = page.getByRole("option", {
          name: adapter.format(month, "MMMM"),
        });
        if (adapter.getMonth(startOfMonth) !== monthIndex) {
          await expect.element(option).toHaveAttribute("aria-disabled", "true");
        } else {
          await expect
            .element(option)
            .not.toHaveAttribute("aria-disabled", "true");
        }
      }
      await page.getByRole("combobox", { name: "Year Dropdown" }).click();
      await expect
        .poll(async () => (await page.getByRole("option").elements()).length)
        .toBe(1);
      for (const date of [startOfMonth, endOfMonth]) {
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(date, "dddd D MMMM YYYY"),
            }),
          )
          .toHaveAttribute("aria-disabled", "true");
      }
      for (const date of [minDate, maxDate]) {
        await expect
          .element(
            page.getByRole("button", {
              name: adapter.format(date, "dddd D MMMM YYYY"),
            }),
          )
          .not.toHaveAttribute("aria-disabled", "true");
      }
    });

    it("SHOULD update min/max month choices when year changes", async () => {
      const minDate = adapter.parse("01/12/2024", "DD/MM/YYYY").date;
      const maxDate = adapter.add(minDate, { years: 1 });
      const defaultVisibleMonth = adapter.add(minDate, { months: 6 });
      await render(
        <Calendar
          selectionVariant="single"
          defaultVisibleMonth={defaultVisibleMonth}
          minDate={minDate}
          maxDate={maxDate}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page.getByRole("combobox", { name: "Year Dropdown" }).click();
      const year = page.getByRole("option", {
        name: adapter.format(minDate, "YYYY"),
      });
      await year.hover();
      await year.click();
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(minDate, "MMM"));
      await page.getByRole("combobox", { name: "Month Dropdown" }).click();
      const minMonth = adapter.getMonth(minDate);
      for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
        const month = adapter.set(adapter.clone(minDate), {
          month: monthIndex,
        });
        const option = page.getByRole("option", {
          name: adapter.format(month, "MMMM"),
        });
        if (monthIndex < minMonth) {
          await expect.element(option).toHaveAttribute("aria-disabled", "true");
        } else {
          await expect
            .element(option)
            .not.toHaveAttribute("aria-disabled", "true");
        }
      }
      await page.getByRole("combobox", { name: "Year Dropdown" }).click();
      await expect
        .poll(async () => (await page.getByRole("option").elements()).length)
        .toBe(2);
    });

    it("SHOULD allow selection of dates", async () => {
      const selectionChange = vi.fn();
      await render(
        <Calendar
          defaultVisibleMonth={testDate}
          selectionVariant="single"
          onSelectionChange={selectionChange}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const day = page.getByRole("button", {
        name: "Saturday 2 March 2024",
      });
      await day.hover();
      await day.click();
      const [, date] = lastCall(selectionChange);
      expect(adapter.format(date, "dddd D MMMM YYYY")).toBe(
        "Saturday 2 March 2024",
      );
    });

    it("SHOULD not allow selection of un-selectable dates", async () => {
      const selectionChange = vi.fn();
      await render(
        <UnselectableDates
          defaultVisibleMonth={testDate}
          onSelectionChange={selectionChange}
        />,
      );
      const weekendDates = [2, 3, 9, 10, 16, 17, 23, 24, 30, 31].map((day) =>
        adapter.set(adapter.clone(testDate), { day }),
      );
      for (const date of weekendDates) {
        const day = page.getByRole("button", {
          name: adapter.format(date, "dddd D MMMM YYYY"),
        });
        await expect.element(day).toHaveAttribute("aria-disabled", "true");
        await day.hover();
        await expectTooltipContent(day, "weekends are un-selectable");
      }
      expect(selectionChange).not.toHaveBeenCalled();
    });

    it("SHOULD navigate across un-selectable dates using keyboard", async () => {
      await render(<UnselectableDates defaultVisibleMonth={testDate} />);
      const friday = page.getByRole("button", {
        name: "Friday 1 March 2024",
      });
      focus(friday);
      await userEvent.keyboard("{ArrowRight}");
      const saturday = page.getByRole("button", {
        name: "Saturday 2 March 2024",
      });
      await expect.element(saturday).toHaveFocus();
      await expect.element(saturday).toHaveAttribute("aria-disabled", "true");
      await saturday.hover();
      await expectTooltipContent(saturday, "weekends are un-selectable");
      await userEvent.keyboard("{ArrowRight}");
      const sunday = page.getByRole("button", {
        name: "Sunday 3 March 2024",
      });
      await expect.element(sunday).toHaveFocus();
      await expect.element(sunday).toHaveAttribute("aria-disabled", "true");
      await userEvent.keyboard("{ArrowRight}");
      const monday = page.getByRole("button", {
        name: "Monday 4 March 2024",
      });
      await expect.element(monday).toHaveFocus();
      await expect.element(monday).not.toHaveAttribute("aria-disabled", "true");
    });
  });
}

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(adapterMoment);
});
