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
  CalendarWeekHeader,
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
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );

        // Simulate hovering over the base date button
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realHover();

        // Verify that all dates in the range are highlighted correctly
        datesInRange.forEach((dateInRange, index) => {
          let expectedClassName = "saltCalendarDay-hoveredSpan";
          if (index === 0) {
            expectedClassName = "saltCalendarDay-hoveredStart";
          } else if (index === datesInRange.length - 1) {
            expectedClassName = "saltCalendarDay-hoveredEnd";
          }
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "DD MMMM YYYY"),
          }).should("have.class", expectedClassName);
        });

        // Simulate clicking the base date button to select the range
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();

        // Verify that all dates in the range are selected
        datesInRange.forEach((dateInRange) => {
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
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
          name: adapter.format(newBaseDate, "DD MMMM YYYY"),
        }).realClick();

        // Verify that all dates in the new range are selected
        datesInNewRange.forEach((dateInRange) => {
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
        });

        // Verify that the previous range is unselected
        datesInRange.forEach((dateInRange) => {
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "DD MMMM YYYY"),
          }).should("not.have.attr", "aria-pressed");
        });

        // Simulate pressing the ArrowUp key to move the focus
        cy.realPress("ArrowUp");
        // Simulate pressing the Enter key to select the range
        cy.realPress("Enter");

        // Verify that the original range is selected again
        datesInRange.forEach((dateInRange) => {
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
        });
      });
    });
  });
});

describe('GIVEN a Calendar with `selectionVariant="offset" and `multiselect`', () => {
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

      const endDateOffset = (date: ReturnType<typeof adapter.date>) =>
        adapter.add(date, { days: 3 });
      const testStartDate1 = adapter.parse("03/02/2024", "DD/MM/YYYY").date;
      const testDate = {
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
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the first selected date of the visible month
        cy.findByRole("button", {
          name: adapter.format(testDate.startDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD move to today's date if selected date is not within the visible month", () => {
        const todayTestDate = adapter.today();
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
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to today's date
        cy.findByRole("button", {
          name: adapter.format(todayTestDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD move to today's date if there is no selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={todayTestDate}
            endDateOffset={endDateOffset}
          >
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to today's date
        cy.findByRole("button", {
          name: adapter.format(todayTestDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="offset"
            multiselect
            defaultVisibleMonth={adapter.add(todayTestDate, { months: 1 })}
            endDateOffset={endDateOffset}
          >
            <CalendarNavigation />
            <CalendarWeekHeader />
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
        let startOfMonth = adapter.startOf(todayTestDate, "month");
        startOfMonth = adapter.add(startOfMonth, { months: 2 });
        cy.findByRole("button", {
          name: adapter.format(startOfMonth, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD allow multiple dates to be selected and unselected", () => {
        const testDate = adapter.today();

        const selectStub = (
          previousSelectedDate: DateRangeSelection<DateFrameworkType>[],
          newDate: DateFrameworkType,
        ) => {
          let newSelection = previousSelectedDate.filter(
            ({ startDate, endDate }) => {
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
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );

        const verifySelection = (
          date: DateFrameworkType,
          isSelected: boolean,
        ) => {
          cy.findByRole("button", {
            name: adapter.format(date, "DD MMMM YYYY"),
          }).should(
            `${isSelected ? "" : "not."}have.attr`,
            "aria-pressed",
            "true",
          );
        };

        const verifyDateRangeSelection = (
          baseDate: DateFrameworkType,
          isSelected: boolean,
        ) => {
          for (let i = 0; i <= 3; i++) {
            verifySelection(adapter.add(baseDate, { days: i }), isSelected);
          }
        };

        // Simulate selecting the offset through mouse click
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the offset is selected
        verifyDateRangeSelection(testDate, true);

        // Simulate unselecting the offset through mouse click
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the offset is unselected
        verifyDateRangeSelection(testDate, false);

        // Simulate selecting the offset through keyboard selection
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("be.focused");
        // Simulate pressing the Enter key to select the current date
        cy.realPress("Enter");
        // Verify that the offset is selected
        verifyDateRangeSelection(testDate, true);

        // Simulate unselecting the offset through keyboard selection
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("be.focused");
        // Simulate pressing the Enter key to select the current date
        cy.realPress("Enter");
        // Verify that the offset is unselected
        verifyDateRangeSelection(testDate, false);
      });
    });
  });
});
