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
import * as calendarStories from "~stories/calendar/calendar.stories";
import { renderWithSalt } from "../render";

const {
  RangeWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: Storybook story type
} = calendarStories as any;

function focusNextMonthAndTab() {
  const next = page.getByRole("button", { name: "Next Month" });
  (next.element() as HTMLElement).focus();
  return userEvent.tab();
}

async function expectFocused(name: string) {
  const day = page.getByRole("button", { name });
  await expect.element(day).toHaveClass(/saltCalendarDay-focused/);
  await expect.element(day).toHaveFocus();
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

function registerRangeTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(new Date(2024, 4, 6)));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapter });
    const formatted = (date: DateFrameworkType) =>
      adapter.format(date, "dddd D MMMM YYYY");

    it("SHOULD move to start date selected if it is within visible month", async () => {
      const today = adapter.today();
      const startDate = adapter.add(adapter.startOf(today, "month"), {
        days: 1,
      });
      const endDate = adapter.endOf(today, "month");
      await render(
        <Calendar
          selectionVariant="range"
          selectedDate={{ startDate, endDate }}
          defaultVisibleMonth={today}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(`Start date: ${formatted(startDate)}, selected`);
    });

    it("SHOULD move to end date selected if it is within visible month and startDate is not", async () => {
      const today = adapter.today();
      const startDate = adapter.subtract(adapter.startOf(today, "month"), {
        months: 1,
      });
      const endDate = adapter.endOf(today, "month");
      await render(
        <Calendar
          selectionVariant="range"
          selectedDate={{ startDate, endDate }}
          defaultVisibleMonth={today}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(`End range: ${formatted(endDate)}, selected`);
    });

    it("SHOULD move to today's date if selected range is not within the visible month", async () => {
      const today = adapter.today();
      const startDate = adapter.subtract(adapter.startOf(today, "month"), {
        months: 2,
      });
      const endDate = adapter.subtract(today, { months: 1 });
      await render(
        <Calendar
          selectionVariant="range"
          selectedDate={{ startDate, endDate }}
          defaultVisibleMonth={today}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(`Start new range: ${formatted(today)}`);
    });

    for (const emptySelectedRange of [false, true]) {
      it(`SHOULD move to today's date if there is ${emptySelectedRange ? "an empty selected range" : "not a selected date"}`, async () => {
        const today = adapter.today();
        await render(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={today}
            selectedDate={
              emptySelectedRange
                ? { startDate: undefined, endDate: undefined }
                : undefined
            }
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        await focusNextMonthAndTab();
        await expectFocused(formatted(today));
      });
    }

    it("SHOULD move to start of the month if there is no selected date and today is not within visible month", async () => {
      const today = adapter.today();
      const startOfMonth = adapter.startOf(today, "month");
      await render(
        <Calendar
          selectionVariant="range"
          defaultVisibleMonth={adapter.add(startOfMonth, { months: 1 })}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const next = page.getByRole("button", { name: "Next Month" });
      (next.element() as HTMLElement).focus();
      await next.click();
      await userEvent.tab();
      await expectFocused(formatted(adapter.add(startOfMonth, { months: 2 })));
    });

    it("SHOULD move to start of the month if the full month is part of a selected range", async () => {
      const today = adapter.today();
      const startDate = adapter.subtract(adapter.startOf(today, "month"), {
        months: 2,
      });
      const endDate = adapter.add(today, { months: 2 });
      await render(
        <Calendar
          selectionVariant="range"
          defaultSelectedDate={{ startDate, endDate }}
          defaultVisibleMonth={startDate}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(`Start date: ${formatted(startDate)}, selected`);
    });

    it("SHOULD allow a range to be selected", async () => {
      const startDate = adapter.subtract(
        adapter.startOf(adapter.today(), "month"),
        { months: 2 },
      );
      const middleDate = adapter.add(startDate, { days: 1 });
      const endDate = adapter.add(startDate, { days: 2 });
      await render(
        <Calendar selectionVariant="range" defaultVisibleMonth={startDate}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page.getByRole("button", { name: formatted(startDate) }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: `Start date: ${formatted(startDate)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await page.getByRole("button", { name: formatted(endDate) }).hover();
      await expect
        .element(page.getByRole("button", { name: formatted(middleDate) }))
        .toHaveClass("saltCalendarDay-hoveredSpan");
      const hoveredEnd = page.getByRole("button", {
        name: `${formatted(endDate)}, select as end date`,
      });
      await expect
        .element(hoveredEnd)
        .toHaveClass("saltCalendarDay-hoveredEnd");
      await hoveredEnd.click();
      await expect
        .element(
          page.getByRole("button", {
            name: `Start date: ${formatted(startDate)}, selected`,
          }),
        )
        .toHaveClass("saltCalendarDay-selectedStart");
      await expect
        .element(
          page.getByRole("button", {
            name: `In range: ${formatted(middleDate)}, selected`,
          }),
        )
        .toHaveClass("saltCalendarDay-selectedSpan");
      await expect
        .element(
          page.getByRole("button", {
            name: `End range: ${formatted(endDate)}, selected`,
          }),
        )
        .toHaveClass("saltCalendarDay-selectedEnd");

      const newStartDate = adapter.add(startDate, { weeks: 1 });
      await page.getByRole("button", { name: formatted(newStartDate) }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: `Start date: ${formatted(newStartDate)}, selected`,
          }),
        )
        .toBeInTheDocument();
      expect(
        document.querySelectorAll(
          'button[aria-label^="Start date:"][aria-label$=", selected"]',
        ),
      ).toHaveLength(1);
      await page.getByRole("button", { name: formatted(startDate) }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: `Start date: ${formatted(startDate)}, selected`,
          }),
        )
        .toBeInTheDocument();
      expect(
        document.querySelectorAll(
          'button[aria-label^="Start date:"][aria-label$=", selected"]',
        ),
      ).toHaveLength(1);
    });

    it("SHOULD be able to navigate between months through focus", async () => {
      const startDate = adapter.subtract(
        adapter.startOf(adapter.today(), "month"),
        { months: 2 },
      );
      await render(
        <Calendar selectionVariant="range" defaultVisibleMonth={startDate}>
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
        .getByRole("button", { name: formatted(weekBeforeEnd) })
        .click();
      await userEvent.keyboard("{ArrowDown}");
      await expectFocused(`${formatted(nextMonth)}, select as end date`);
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(nextMonth, "MMM"));
      await userEvent.keyboard("{ArrowUp}");
      await expectFocused(`Start date: ${formatted(weekBeforeEnd)}, selected`);
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(startDate, "MMM"));
    });

    const localMidnightStartIso = new Date(2025, 0, 5).toISOString();
    const localMidnightEndIso = new Date(2025, 0, 6).toISOString();
    const timezoneCases = [
      ["default", localMidnightStartIso, localMidnightEndIso],
      ["system", localMidnightStartIso, localMidnightEndIso],
      ["UTC", "2025-01-05T00:00:00.000Z", "2025-01-06T00:00:00.000Z"],
      [
        "America/New_York",
        "2025-01-05T05:00:00.000Z",
        "2025-01-06T05:00:00.000Z",
      ],
      ["Europe/London", "2025-01-05T00:00:00.000Z", "2025-01-06T00:00:00.000Z"],
      ["Asia/Shanghai", "2025-01-04T16:00:00.000Z", "2025-01-05T16:00:00.000Z"],
      ["Asia/Kolkata", "2025-01-04T18:30:00.000Z", "2025-01-05T18:30:00.000Z"],
    ] as const;
    for (const [timezone, expectedStart, expectedEnd] of timezoneCases) {
      it(`SHOULD render date in the ${timezone} timezone`, async () => {
        await render(
          <RangeWithTimezone
            defaultVisibleMonth={
              adapter.parse("01 Jan 2025", "DD MMM YYYY").date
            }
          />,
        );
        await chooseTimezone(timezone);
        await page
          .getByRole("button", { name: "Sunday 5 January 2025" })
          .click();
        await page
          .getByRole("button", { name: "Monday 6 January 2025" })
          .click();
        await expect
          .element(page.getByTestId("iso-start-date-label"))
          .toHaveTextContent(expectedStart);
        await expect
          .element(page.getByTestId("iso-end-date-label"))
          .toHaveTextContent(expectedEnd);
      });
    }
  });
}

function registerMultiselectTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(new Date(2024, 4, 6)));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapter });
    const formatted = (date: DateFrameworkType) =>
      adapter.format(date, "dddd D MMMM YYYY");
    const testRange = {
      startDate: adapter.parse("03/02/2024", "DD/MM/YYYY").date,
      endDate: adapter.parse("05/02/2024", "DD/MM/YYYY").date,
    };

    it("SHOULD move to first selected date of the visible month", async () => {
      await render(
        <Calendar
          selectionVariant="range"
          multiselect
          defaultVisibleMonth={testRange.startDate}
          defaultSelectedDate={[
            testRange,
            {
              startDate: adapter.add(testRange.startDate, { days: 3 }),
              endDate: adapter.add(testRange.endDate, { days: 3 }),
            },
            {
              startDate: adapter.add(testRange.startDate, { days: 5 }),
              endDate: adapter.add(testRange.endDate, { days: 5 }),
            },
          ]}
          hideOutOfRangeDates
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(
        `Start date: ${formatted(testRange.startDate)}, selected`,
      );
    });

    for (const selectedOutside of [true, false]) {
      it(`SHOULD move to today's date ${selectedOutside ? "if selected date is not within the visible month" : "if there is not selected date"}`, async () => {
        const today = adapter.today();
        await render(
          <Calendar
            selectionVariant="range"
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
            hideOutOfRangeDates={selectedOutside}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        await focusNextMonthAndTab();
        await expectFocused(
          selectedOutside
            ? `Start new range: ${formatted(today)}`
            : formatted(today),
        );
      });
    }

    it("SHOULD move to start of the month if there is no selected date and today is not within visible month", async () => {
      const today = adapter.today();
      await render(
        <Calendar
          selectionVariant="range"
          multiselect
          defaultVisibleMonth={adapter.add(today, { months: 1 })}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const next = page.getByRole("button", { name: "Next Month" });
      (next.element() as HTMLElement).focus();
      await next.click();
      await userEvent.tab();
      const start = adapter.add(adapter.startOf(today, "month"), { months: 2 });
      await expectFocused(formatted(start));
    });

    it("SHOULD allow multiple dates to be selected and unselected", async () => {
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
          const last = next.at(-1);
          if (last?.startDate && !last.endDate) last.endDate = newDate;
          else next = [...next, { startDate: newDate }];
        }
        return next;
      };
      await render(
        <Calendar
          selectionVariant="range"
          multiselect
          defaultVisibleMonth={today}
          select={select}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page.getByRole("button", { name: formatted(today) }).click();
      const nextDay = adapter.add(today, { days: 1 });
      await page.getByRole("button", { name: formatted(nextDay) }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: `End range: ${formatted(nextDay)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await page
        .getByRole("button", {
          name: `Start date: ${formatted(today)}, selected`,
        })
        .click();
      const todayButton = page.getByRole("button", {
        name: `Start new range: ${formatted(today)}`,
      });
      await expect.element(todayButton).toBeInTheDocument();
      await expectFocused(`Start new range: ${formatted(today)}`);
      await userEvent.keyboard("{Enter}{ArrowRight}{Enter}");
      await expect
        .element(
          page.getByRole("button", {
            name: `Start date: ${formatted(today)}, selected`,
          }),
        )
        .toBeInTheDocument();
      const selectedEnd = page.getByRole("button", {
        name: `End range: ${formatted(nextDay)}, selected`,
      });
      await expect.element(selectedEnd).toBeInTheDocument();
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByRole("button", { name: formatted(today) }))
        .toBeInTheDocument();
      await expect
        .element(
          page.getByRole("button", {
            name: `Start new range: ${formatted(nextDay)}`,
          }),
        )
        .toBeInTheDocument();
    });
  });
}

describe('GIVEN a Calendar with selectionVariant="range"', () => {
  registerRangeTests(new AdapterDateFnsTZ());
  registerRangeTests(new AdapterDayjs());
  registerRangeTests(new AdapterLuxon());
  registerRangeTests(new AdapterMoment());
});

describe('GIVEN a Calendar with selectionVariant="range" and multiselect', () => {
  registerMultiselectTests(new AdapterDateFnsTZ());
  registerMultiselectTests(new AdapterDayjs());
  registerMultiselectTests(new AdapterLuxon());
  registerMultiselectTests(new AdapterMoment());
});
