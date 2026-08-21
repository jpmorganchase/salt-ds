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
  type SingleDateSelection,
} from "@salt-ds/date-components";
import MockDate from "mockdate";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as calendarStories from "~stories/calendar/calendar.stories";
import { renderWithSalt } from "../render";

const {
  SingleWithTimezone,
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
  const locator = page.elementLocator(dropdown);
  await locator.click();
  const option = page.getByRole("option", { name: timezone });
  await option.hover();
  await option.click();
  await expect.element(locator).toHaveTextContent(timezone);
}

function registerSingleTests(
  // biome-ignore lint/suspicious/noExplicitAny: shared behavior across adapter date types
  adapter: SaltDateAdapter<any>,
) {
  describe(`Tests with ${adapter.lib}`, () => {
    beforeEach(() => MockDate.set(new Date(2024, 4, 6)));
    afterEach(() => MockDate.reset());

    const render = (children: ReactNode) =>
      renderWithSalt(children, { dateAdapter: adapter });
    const testDate = adapter.parse("03/02/2024", "DD/MM/YYYY").date;
    const formatted = (date: DateFrameworkType) =>
      adapter.format(date, "dddd D MMMM YYYY");

    it("SHOULD move to selected date if it is within the visible month", async () => {
      await render(
        <Calendar
          selectionVariant="single"
          selectedDate={testDate}
          defaultVisibleMonth={testDate}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(`${formatted(testDate)}, selected`);
    });

    it("SHOULD move to selected date when navigating back to selection month", async () => {
      await render(
        <Calendar
          selectionVariant="single"
          selectedDate={testDate}
          defaultVisibleMonth={testDate}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(testDate)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await page.getByRole("button", { name: "Next Month" }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: formatted(adapter.add(testDate, { months: 1 })),
          }),
        )
        .toBeInTheDocument();
      await page.getByRole("button", { name: "Previous Month" }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(testDate)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await focusNextMonthAndTab();
      await expectFocused(`${formatted(testDate)}, selected`);
    });

    it("SHOULD move to today's date if selected date is not within the visible month", async () => {
      const today = adapter.today();
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={today}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(formatted(today));
    });

    it("SHOULD move to today's date if there is no selected date", async () => {
      const today = adapter.today();
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={today}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(formatted(today));
    });

    it("SHOULD move to today's date if there is no selected date after navigating", async () => {
      const today = adapter.today();
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={today}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await expect
        .element(page.getByRole("button", { name: formatted(today) }))
        .toBeInTheDocument();
      await page.getByRole("button", { name: "Next Month" }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: formatted(adapter.add(today, { months: 1 })),
          }),
        )
        .toBeInTheDocument();
      await page.getByRole("button", { name: "Previous Month" }).click();
      await focusNextMonthAndTab();
      await expectFocused(formatted(today));
    });

    it("SHOULD move to start of the month if there is no selected date and today is not within visible month", async () => {
      const today = adapter.today();
      await render(
        <Calendar
          selectionVariant="single"
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

    it("SHOULD only allow one date to be selected at a time", async () => {
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page.getByRole("button", { name: formatted(testDate) }).click();
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(testDate)}, selected`,
          }),
        )
        .toBeInTheDocument();
      let nextDay = adapter.add(testDate, { days: 1 });
      await page.getByRole("button", { name: formatted(nextDay) }).click();
      await expect
        .element(page.getByRole("button", { name: formatted(testDate) }))
        .toBeInTheDocument();
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(nextDay)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await userEvent.keyboard("{ArrowRight}{Enter}");
      nextDay = adapter.add(nextDay, { days: 1 });
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(nextDay)}, selected`,
          }),
        )
        .toBeInTheDocument();
    });

    it("SHOULD be able to navigate between months through focus", async () => {
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      const weekBeforeEnd = adapter.subtract(adapter.endOf(testDate, "month"), {
        days: 6,
      });
      const nextMonth = adapter.startOf(
        adapter.add(testDate, { months: 1 }),
        "month",
      );
      await page
        .getByRole("button", { name: formatted(weekBeforeEnd) })
        .click();
      await userEvent.keyboard("{ArrowDown}");
      await expectFocused(formatted(nextMonth));
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(nextMonth, "MMM"));
      await userEvent.keyboard("{ArrowUp}");
      await expectFocused(`${formatted(weekBeforeEnd)}, selected`);
      await expect
        .element(page.getByRole("combobox", { name: "Month Dropdown" }))
        .toHaveTextContent(adapter.format(testDate, "MMM"));
    });

    it("SHOULD not allow deselection", async () => {
      await render(
        <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await page.getByRole("button", { name: formatted(testDate) }).click();
      const selected = page.getByRole("button", {
        name: `${formatted(testDate)}, selected`,
      });
      await selected.click();
      await expect.element(selected).toBeInTheDocument();
    });

    const timezoneCases = [
      ["default", "2025-01-05T00:00:00.000Z"],
      ["system", "2025-01-05T00:00:00.000Z"],
      ["UTC", "2025-01-05T00:00:00.000Z"],
      ["America/New_York", "2025-01-05T05:00:00.000Z"],
      ["Europe/London", "2025-01-05T00:00:00.000Z"],
      ["Asia/Shanghai", "2025-01-04T16:00:00.000Z"],
      ["Asia/Kolkata", "2025-01-04T18:30:00.000Z"],
    ] as const;
    for (const [timezone, expectedResult] of timezoneCases) {
      it(`SHOULD render date in the ${timezone} timezone`, async () => {
        await render(
          <SingleWithTimezone
            defaultVisibleMonth={
              adapter.parse("01 Jan 2025", "DD MMM YYYY").date
            }
          />,
        );
        await chooseTimezone(timezone);
        await page
          .getByRole("button", { name: "Sunday 5 January 2025" })
          .click();
        await expect
          .element(page.getByTestId("iso-date-label"))
          .toHaveTextContent(expectedResult);
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
    const testDate = adapter.parse("03/02/2024", "DD/MM/YYYY").date;
    const formatted = (date: DateFrameworkType) =>
      adapter.format(date, "dddd D MMMM YYYY");

    it("SHOULD move to first selected date of the visible month", async () => {
      await render(
        <Calendar
          selectionVariant="single"
          multiselect
          defaultVisibleMonth={testDate}
          defaultSelectedDate={[
            testDate,
            adapter.add(testDate, { days: 3 }),
            adapter.add(testDate, { days: 8 }),
          ]}
          hideOutOfRangeDates
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>,
      );
      await focusNextMonthAndTab();
      await expectFocused(`${formatted(testDate)}, selected`);
    });

    for (const selectedOutside of [true, false]) {
      it(`SHOULD move to today's date ${selectedOutside ? "if selected date is not within the visible month" : "if there is not selected date"}`, async () => {
        const today = adapter.today();
        await render(
          <Calendar
            selectionVariant="single"
            multiselect
            defaultVisibleMonth={today}
            defaultSelectedDate={
              selectedOutside
                ? [adapter.subtract(today, { months: 2 })]
                : undefined
            }
            hideOutOfRangeDates={selectedOutside}
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
      await render(
        <Calendar
          selectionVariant="single"
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
        previous: SingleDateSelection[],
        newDate: DateFrameworkType,
      ) => {
        let next = previous.filter(
          (previousDate) => adapter.compare(previousDate, newDate) !== 0,
        );
        if (next.length === previous.length) next = [...next, newDate];
        return next;
      };
      await render(
        <Calendar
          selectionVariant="single"
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
            name: `${formatted(today)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(nextDay)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await page
        .getByRole("button", { name: `${formatted(nextDay)}, selected` })
        .click();
      await page
        .getByRole("button", { name: `${formatted(today)}, selected` })
        .click();
      await expectFocused(formatted(today));
      await userEvent.keyboard("{Enter}{ArrowRight}{Enter}");
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(today)}, selected`,
          }),
        )
        .toBeInTheDocument();
      await expect
        .element(
          page.getByRole("button", {
            name: `${formatted(nextDay)}, selected`,
          }),
        )
        .toBeInTheDocument();
    });
  });
}

describe('GIVEN a Calendar with selectionVariant="single"', () => {
  registerSingleTests(new AdapterDateFnsTZ());
  registerSingleTests(new AdapterDayjs());
  registerSingleTests(new AdapterLuxon());
  registerSingleTests(new AdapterMoment());
});

describe('GIVEN a Calendar with selectionVariant="single" and multiselect', () => {
  registerMultiselectTests(new AdapterDateFnsTZ());
  registerMultiselectTests(new AdapterDayjs());
  registerMultiselectTests(new AdapterLuxon());
  registerMultiselectTests(new AdapterMoment());
});
