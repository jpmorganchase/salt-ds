import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type DateRangeSelection,
} from "@salt-ds/lab";

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

function getAllDatesInRange(
  adapter: SaltDateAdapter<DateFrameworkType>,
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

describe('GIVEN a Calendar with `selectionVariant="offset"`', () => {
  adapters.forEach((adapter: SaltDateAdapter<DateFrameworkType>) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      const testDate = adapter.parse("03/02/2024", "DD/MM/YYYY").date;

      it("SHOULD allow a defined range to be selected", () => {
        const endDateOffset = (date: ReturnType<typeof adapter.date>) =>
          adapter.add(date, { days: 4 });
        const offsetDate = endDateOffset(testDate);
        const datesInRange = getAllDatesInRange(adapter, testDate, offsetDate);

        cy.mount(
          <Calendar
            selectionVariant="offset"
            defaultVisibleMonth={testDate}
            endDateOffset={endDateOffset}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );

        // Simulate hovering over the base date button
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        }).realHover();

        // Verify that all dates in the range are highlighted correctly
        datesInRange.forEach((dateInRange, index) => {
          let expectedClassName = "saltCalendarDay-hoveredSpan";
          let expectedLabel = adapter.format(dateInRange, "dddd D MMMM YYYY");
          if (index === 0) {
            expectedClassName = "saltCalendarDay-hoveredStart";
            expectedLabel = `Start new range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          } else if (index === datesInRange.length - 1) {
            expectedClassName = "saltCalendarDay-hoveredEnd";
            expectedLabel = `Complete new range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          }
          cy.findByRole("button", {
            name: expectedLabel,
          }).should("have.class", expectedClassName);
        });

        // Simulate clicking the base date button to select the range
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).realClick();

        // Verify that all dates in the range are selected
        datesInRange.forEach((dateInRange, index) => {
          let expectedLabel = `In selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          if (index === 0) {
            expectedLabel = `Start selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          } else if (index === datesInRange.length - 1) {
            expectedLabel = `End selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          }
          cy.findByRole("button", {
            name: expectedLabel,
          }).should("exist");
        });

        const newBaseDate = adapter.add(testDate, { weeks: 1 });
        const newOffsetDate = adapter.add(newBaseDate, { days: 4 });
        const datesInNewRange = getAllDatesInRange(
          adapter,
          newBaseDate,
          newOffsetDate,
        );

        // Simulate clicking a new base date button to select a new range
        cy.findByRole("button", {
          name: adapter.format(newBaseDate, "dddd D MMMM YYYY"),
        }).realClick();

        // Verify that all dates in the new range are selected
        datesInNewRange.forEach((dateInRange, index) => {
          let expectedLabel = `In selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          if (index === 0) {
            expectedLabel = `Start selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          } else if (index === datesInRange.length - 1) {
            expectedLabel = `End selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          }
          cy.findByRole("button", {
            name: expectedLabel,
          }).should("exist");
        });

        // Verify that the previous range is unselected
        datesInRange.forEach((dateInRange) => {
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "dddd D MMMM YYYY"),
          }).should("exist");
        });

        // Simulate pressing the ArrowUp key to move the focus
        cy.realPress("ArrowUp");
        // Simulate pressing the Enter key to select the range
        cy.realPress("Enter");

        // Verify that the original range is selected again
        datesInRange.forEach((dateInRange, index) => {
          let expectedLabel = `In selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          if (index === 0) {
            expectedLabel = `Start selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          } else if (index === datesInRange.length - 1) {
            expectedLabel = `End selected range: ${adapter.format(dateInRange, "dddd D MMMM YYYY")}`;
          }
          cy.findByRole("button", {
            name: expectedLabel,
          }).should("exist");
        });
      });

      it("SHOULD be able to navigate between months through focus", () => {
        const endDateOffset = (date: ReturnType<typeof adapter.date>) =>
          adapter.add(date, { days: 4 });
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 2 });

        cy.mount(
          <Calendar
            selectionVariant="offset"
            defaultVisibleMonth={startDate}
            endDateOffset={endDateOffset}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );

        // Simulate pressing the ArrowDown key to move the next month
        const weekbeforeEndOfMonth = adapter.subtract(
          adapter.endOf(startDate, "month"),
          { days: 6 },
        );
        const nextMonth = adapter.startOf(
          adapter.add(startDate, { months: 1 }),
          "month",
        );
        cy.findByRole("button", {
          name: adapter.format(weekbeforeEndOfMonth, "dddd D MMMM YYYY"),
        }).realClick();
        cy.realPress("ArrowDown");
        // Verify that the focus moves to the next month
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(nextMonth, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
        // Verify that the calendar navigates to the next month
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          adapter.format(nextMonth, "MMM"),
        );

        // Simulate pressing the ArrowUp key to move back to previous month
        cy.realPress("ArrowUp");
        // Verify that the focus moves to the next month
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(weekbeforeEndOfMonth, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
        // Verify that the calendar navigates to the next month
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          adapter.format(startDate, "MMM"),
        );
      });
    });
  });
});

function assertRangeUnselected(
  adapter: SaltDateAdapter<DateFrameworkType>,
  baseDate: DateFrameworkType,
) {
  for (let i = 0; i <= 3; i++) {
    const date = adapter.add(baseDate, { days: i });
    const label = adapter.format(date, "dddd D MMMM YYYY");
    cy.findByRole("button", { name: label }).should("exist");
  }
}

function assertRangeSelected(
  adapter: SaltDateAdapter<DateFrameworkType>,
  baseDate: DateFrameworkType,
) {
  for (let i = 0; i <= 3; i++) {
    const date = adapter.add(baseDate, { days: i });
    let label;
    if (i === 0) {
      label = `Start selected range: ${adapter.format(date, "dddd D MMMM YYYY")}`;
    } else if (i === 3) {
      label = `End selected range: ${adapter.format(date, "dddd D MMMM YYYY")}`;
    } else {
      label = `In selected range: ${adapter.format(date, "dddd D MMMM YYYY")}`;
    }
    cy.findByRole("button", { name: label }).should("exist");
  }
}

describe('GIVEN a Calendar with `selectionVariant="offset" and `multiselect`', () => {
  adapters.forEach((adapter) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      const endDateOffset = (date: DateFrameworkType) =>
        adapter.add(date, { days: 3 });
      const testStartDate1 = adapter.parse("03/02/2024", "DD/MM/YYYY").date;
      const testDate: DateRangeSelection<DateFrameworkType> = {
        startDate: testStartDate1,
        endDate: endDateOffset(testStartDate1),
      };

      it("SHOULD move to first selected date of the visible month", () => {
        const testStartDate2 = adapter.add(testDate.startDate, { days: 4 });
        const testStartDate3 = adapter.add(testDate.startDate, { days: 5 });
        cy.mount(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={testDate.startDate}
            defaultSelectedDate={[
              testDate,
              {
                startDate: testStartDate2,
                endDate: endDateOffset(testStartDate2),
              },
              {
                startDate: testStartDate3,
                endDate: endDateOffset(testStartDate3),
              },
            ]}
            endDateOffset={endDateOffset}
            hideOutOfRangeDates
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", { name: "Next Month" }).focus();
        cy.realPress("Tab");
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(testDate.startDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if selected date is not within the visible month", () => {
        const todayTestDate: DateFrameworkType = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={todayTestDate}
            defaultSelectedDate={[
              {
                startDate: adapter.subtract(todayTestDate, { months: 2 }),
                endDate: adapter.subtract(todayTestDate, { months: 2 }),
              },
            ]}
            endDateOffset={endDateOffset}
            hideOutOfRangeDates
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        cy.findByRole("button", { name: "Next Month" }).focus();
        cy.realPress("Tab");
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(todayTestDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if there is no selected date", () => {
        const todayTestDate: DateFrameworkType = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={todayTestDate}
            endDateOffset={endDateOffset}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        cy.findByRole("button", { name: "Next Month" }).focus();
        cy.realPress("Tab");
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(todayTestDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
        const todayTestDate: DateFrameworkType = adapter.today();
        const visibleMonth = adapter.add(todayTestDate, { months: 1 });
        cy.mount(
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
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate clicking the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the start of the month
        let startOfMonth: DateFrameworkType = adapter.startOf(
          todayTestDate,
          "month",
        );
        startOfMonth = adapter.add(startOfMonth, { months: 2 });
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(startOfMonth, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD allow multiple dates to be selected and unselected", () => {
        const testDate: DateFrameworkType = adapter.today();

        const selectStub = (
          previousSelectedDate: DateFrameworkType,
          newDate: DateFrameworkType,
        ) => {
          let newSelection = previousSelectedDate.filter(
            ({ startDate, endDate }: DateRangeSelection<DateFrameworkType>) => {
              // Check if newDate is not between startDate and endDate
              return !(
                startDate &&
                endDate &&
                adapter.compare(newDate, startDate) >= 0 &&
                adapter.compare(newDate, endDate) <= 0
              );
            },
          );

          if (newSelection.length === previousSelectedDate.length) {
            newSelection = [
              ...newSelection,
              { startDate: newDate, endDate: endDateOffset(newDate) },
            ];
          }

          return newSelection;
        };

        cy.mount(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={testDate}
            endDateOffset={endDateOffset}
            select={selectStub}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );

        // Select range
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).realClick();
        cy.findByRole("button", {
          name: adapter.format(
            adapter.startOf(testDate, "month") as DateFrameworkType,
            "dddd D MMMM YYYY",
          ),
        }).realHover();

        assertRangeSelected(adapter, testDate);

        // Unselect range
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).realClick();
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(adapter.startOf(testDate, "month") as DateFrameworkType, "dddd D MMMM YYYY")}`,
        }).realHover();

        assertRangeUnselected(adapter, testDate);

        // Select via keyboard
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
        cy.realPress("Enter");
        assertRangeSelected(adapter, testDate);

        // Unselect via keyboard
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
        cy.realPress("Enter");

        assertRangeUnselected(adapter, testDate);
      });
    });
  });
});
