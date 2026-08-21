import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type DateRangeSelection,
} from "@salt-ds/date-components";
import MockDate from "mockdate";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

function getAllDatesInRange(
  adapter: SaltDateAdapter,
  startDate: DateFrameworkType,
  endDate: DateFrameworkType,
) {
  const dates = [startDate];
  let currentDate = startDate;
  while (!adapter.isSame(currentDate, endDate, "day")) {
    currentDate = adapter.add(currentDate, { days: 1 });
    dates.push(currentDate);
  }
  return dates;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function assertRangeSelected(
  adapter: SaltDateAdapter,
  baseDate: DateFrameworkType,
  days = 3,
) {
  for (let index = 0; index <= days; index++) {
    const date = adapter.add(baseDate, { days: index });
    let label = `In range: ${adapter.format(date, "dddd D MMMM YYYY")}, selected`;
    if (index === 0) {
      label = `Start date: ${adapter.format(date, "dddd D MMMM YYYY")}, selected`;
    } else if (index === days) {
      label = `End range: ${adapter.format(date, "dddd D MMMM YYYY")}, selected`;
    }
    await expect
      .element(page.getByRole("button", { name: label }))
      .toBeInTheDocument();
  }
}

async function assertRangeUnselected(
  adapter: SaltDateAdapter,
  baseDate: DateFrameworkType,
  days = 3,
) {
  for (let index = 0; index <= days; index++) {
    const date = adapter.add(baseDate, { days: index });
    await expect
      .element(
        page.getByRole("button", {
          name: adapter.format(date, "dddd D MMMM YYYY"),
        }),
      )
      .toBeInTheDocument();
  }
}

function focusNextMonthAndTab() {
  const next = page.getByRole("button", { name: "Next Month" });
  (next.element() as HTMLElement).focus();
  return userEvent.tab();
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
    const testDate = adapter.parse("03/02/2024", "DD/MM/YYYY").date;

    it("SHOULD allow a defined range to be selected", async () => {
      const endDateOffset = (date: DateFrameworkType) =>
        adapter.add(date, { days: 4 });
      const datesInRange = getAllDatesInRange(
        adapter,
        testDate,
        endDateOffset(testDate),
      );
      await render(
        <Calendar
          selectionVariant="offset"
          defaultVisibleMonth={testDate}
          endDateOffset={endDateOffset}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page
        .getByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        })
        .hover();
      for (const [index, date] of datesInRange.entries()) {
        let expectedClass = "saltCalendarDay-hoveredSpan";
        let expectedLabel = adapter.format(date, "dddd D MMMM YYYY");
        if (index === 0) {
          expectedClass = "saltCalendarDay-hoveredStart";
          expectedLabel = `Start new range: ${expectedLabel}`;
        } else if (index === datesInRange.length - 1) {
          expectedClass = "saltCalendarDay-hoveredEnd";
          expectedLabel = `${expectedLabel}, select as end date`;
        }
        await expect
          .element(page.getByRole("button", { name: expectedLabel }))
          .toHaveClass(expectedClass);
      }
      await page
        .getByRole("button", {
          name: `Start new range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        })
        .click();
      await assertRangeSelected(adapter, testDate, 4);

      const newBaseDate = adapter.add(testDate, { weeks: 1 });
      await page
        .getByRole("button", {
          name: adapter.format(newBaseDate, "dddd D MMMM YYYY"),
        })
        .click();
      await assertRangeSelected(adapter, newBaseDate, 4);
      await assertRangeUnselected(adapter, testDate, 4);
      await userEvent.keyboard("{ArrowUp}");
      await userEvent.keyboard("{Enter}");
      await assertRangeSelected(adapter, testDate, 4);
    });

    it("SHOULD navigate between months through focus", async () => {
      const endDateOffset = (date: ReturnType<typeof adapter.date>) =>
        adapter.add(date, { days: 4 });
      const startDate = adapter.subtract(
        adapter.startOf(adapter.today(), "month"),
        { months: 2 },
      );
      await render(
        <Calendar
          selectionVariant="offset"
          defaultVisibleMonth={startDate}
          endDateOffset={endDateOffset}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const weekBeforeEnd = adapter.subtract(
        adapter.endOf(startDate, "month"),
        {
          days: 6,
        },
      );
      const nextMonth = adapter.startOf(
        adapter.add(startDate, { months: 1 }),
        "month",
      );
      await page
        .getByRole("button", {
          name: adapter.format(weekBeforeEnd, "dddd D MMMM YYYY"),
        })
        .click();
      await userEvent.keyboard("{ArrowDown}");
      const next = page.getByRole("button", {
        name: `Start new range: ${adapter.format(nextMonth, "dddd D MMMM YYYY")}`,
      });
      await expect.element(next).toHaveFocus();
      await expect.element(next).toHaveClass(/saltCalendarDay-focused/);
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(nextMonth, "MMM"));
      await userEvent.keyboard("{ArrowUp}");
      const previous = page.getByRole("button", {
        name: `Start date: ${adapter.format(weekBeforeEnd, "dddd D MMMM YYYY")}, selected`,
      });
      await expect.element(previous).toHaveFocus();
      await expect.element(previous).toHaveClass(/saltCalendarDay-focused/);
    });

    const endDateOffset = (date: DateFrameworkType) =>
      adapter.add(date, { days: 3 });
    const firstStartDate = testDate;

    it("SHOULD move to first selected date of the visible month", async () => {
      const second = adapter.add(firstStartDate, { days: 4 });
      const third = adapter.add(firstStartDate, { days: 5 });
      await render(
        <Calendar
          selectionVariant="offset"
          multiselect
          defaultVisibleMonth={firstStartDate}
          defaultSelectedDate={[firstStartDate, second, third].map(
            (startDate) => ({
              startDate,
              endDate: endDateOffset(startDate),
            }),
          )}
          endDateOffset={endDateOffset}
          hideOutOfRangeDates
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      const selected = page.getByRole("button", {
        name: `Start date: ${adapter.format(firstStartDate, "dddd D MMMM YYYY")}, selected`,
      });
      await expect.element(selected).toHaveFocus();
      await expect.element(selected).toHaveClass(/saltCalendarDay-focused/);
    });

    for (const selectedOutside of [true, false]) {
      it(`SHOULD move to today's date ${selectedOutside ? "if selection is outside" : "with no selection"}`, async () => {
        const today = adapter.today();
        await render(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={today}
            defaultSelectedDate={
              selectedOutside
                ? [
                    {
                      startDate: adapter.subtract(today, { months: 2 }),
                      endDate: adapter.subtract(today, { months: 2 }),
                    },
                  ]
                : undefined
            }
            endDateOffset={endDateOffset}
            hideOutOfRangeDates={selectedOutside}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        await focusNextMonthAndTab();
        const todayButton = page.getByRole("button", {
          name: `Start new range: ${adapter.format(today, "dddd D MMMM YYYY")}`,
        });
        await expect.element(todayButton).toHaveFocus();
        await expect
          .element(todayButton)
          .toHaveClass(/saltCalendarDay-focused/);
      });
    }

    it("SHOULD move to start of month when today is outside", async () => {
      const visibleMonth = adapter.add(adapter.today(), { months: 1 });
      await render(
        <Calendar
          selectionVariant="offset"
          multiselect
          defaultVisibleMonth={visibleMonth}
          endDateOffset={endDateOffset}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const next = page.getByRole("button", { name: "Next Month" });
      (next.element() as HTMLElement).focus();
      await next.click();
      await userEvent.tab();
      const startOfMonth = adapter.add(
        adapter.startOf(adapter.today(), "month"),
        { months: 2 },
      );
      const day = page.getByRole("button", {
        name: `Start new range: ${adapter.format(startOfMonth, "dddd D MMMM YYYY")}`,
      });
      await expect.element(day).toHaveFocus();
      await expect.element(day).toHaveClass(/saltCalendarDay-focused/);
    });

    it("SHOULD allow multiple ranges to be selected and unselected", async () => {
      const today = adapter.today();
      const select = (
        previous: DateRangeSelection[],
        newDate: DateFrameworkType,
      ) => {
        let next = previous.filter(
          ({ startDate, endDate }) =>
            !(
              startDate &&
              endDate &&
              adapter.compare(newDate, startDate) >= 0 &&
              adapter.compare(newDate, endDate) <= 0
            ),
        );
        if (next.length === previous.length) {
          next = [
            ...next,
            { startDate: newDate, endDate: endDateOffset(newDate) },
          ];
        }
        return next;
      };
      await render(
        <Calendar
          selectionVariant="offset"
          multiselect
          defaultVisibleMonth={today}
          endDateOffset={endDateOffset}
          select={select}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page
        .getByRole("button", {
          name: `Start new range: ${adapter.format(today, "dddd D MMMM YYYY")}`,
        })
        .click();
      await page
        .getByRole("button", {
          name: adapter.format(
            adapter.startOf(today, "month"),
            "dddd D MMMM YYYY",
          ),
        })
        .hover();
      await assertRangeSelected(adapter, today);
      await page
        .getByRole("button", {
          name: `Start date: ${adapter.format(today, "dddd D MMMM YYYY")}, selected`,
        })
        .click();
      await page
        .getByRole("button", {
          name: new RegExp(
            `${escapeRegExp(
              adapter.format(
                adapter.startOf(today, "month"),
                "dddd D MMMM YYYY",
              ),
            )}$`,
          ),
        })
        .hover();
      await assertRangeUnselected(adapter, today);
      const focused = page.getByRole("button", {
        name: adapter.format(today, "dddd D MMMM YYYY"),
      });
      await expect.element(focused).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await assertRangeSelected(adapter, today);
      await userEvent.keyboard("{Enter}");
      await assertRangeUnselected(adapter, today);
    });
  });
}

describe('GIVEN a Calendar with selectionVariant="offset"', () => {
  registerAdapterTests(new AdapterDateFnsTZ());
  registerAdapterTests(new AdapterDayjs());
  registerAdapterTests(new AdapterLuxon());
  registerAdapterTests(new AdapterMoment());
});
