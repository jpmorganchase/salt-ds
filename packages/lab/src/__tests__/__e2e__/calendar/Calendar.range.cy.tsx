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

import * as dateInputStories from "@stories/calendar/calendar.stories";

const {
  // Storybook wraps components in it's own LocalizationProvider, so do not compose Stories
  RangeWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: storybook stories
} = dateInputStories as any;

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

describe('GIVEN a Calendar with `selectionVariant="range"`', () => {
  adapters.forEach((adapter: SaltDateAdapter<any>) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      it("SHOULD move to start date selected if it is within visible month", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.add(startOfMonth, { days: 1 });
        const endDate = adapter.endOf(todayTestDate, "month");
        cy.mount(
          <Calendar
            selectionVariant="range"
            selectedDate={{
              startDate,
              endDate,
            }}
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the start date within the visible month
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(startDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to end date selected if it is within visible month and startDate is not", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 1 });
        const endDate = adapter.endOf(todayTestDate, "month");
        cy.mount(
          <Calendar
            selectionVariant="range"
            selectedDate={{
              startDate,
              endDate,
            }}
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the end date within the visible month
        cy.findByRole("button", {
          name: `End selected range: ${adapter.format(endDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if selected range is not within the visible month", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 2 });
        const endDate = adapter.subtract(todayTestDate, { months: 1 });
        cy.mount(
          <Calendar
            selectionVariant="range"
            selectedDate={{
              startDate,
              endDate,
            }}
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
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
          name: `Start new range: ${adapter.format(todayTestDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if there is not a selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
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
          name: adapter.format(todayTestDate, "dddd D MMMM YYYY"),
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if there is an empty selected range", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={todayTestDate}
            selectedDate={{ startDate: undefined, endDate: undefined }}
          >
            <CalendarNavigation />
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
          name: adapter.format(todayTestDate, "dddd D MMMM YYYY"),
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const defaultVisibleMonth = adapter.add(startOfMonth, { months: 1 });
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={defaultVisibleMonth}
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
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startOfMonth, { months: 2 }),
            "dddd D MMMM YYYY",
          ),
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to start of the month if the full month is part of a selected range", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 2 });
        const endDate = adapter.add(todayTestDate, { months: 2 });
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultSelectedDate={{ startDate, endDate }}
            defaultVisibleMonth={startDate}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the start of the month
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(startDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD allow a range to be selected", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 2 });
        const endDate = adapter.add(startDate, { days: 2 });

        cy.mount(
          <Calendar selectionVariant="range" defaultVisibleMonth={startDate}>
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking on the start date button to select it
        cy.findByRole("button", {
          name: adapter.format(startDate, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the start date button is selected
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(startDate, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate hovering over the end date button to select the range
        cy.findByRole("button", {
          name: adapter.format(endDate, "dddd D MMMM YYYY"),
        }).realHover();
        // Verify that the dates in the range are highlighted
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startDate, { days: 1 }),
            "dddd D MMMM YYYY",
          ),
        }).should("have.class", "saltCalendarDay-hoveredSpan");
        cy.findByRole("button", {
          name: `Complete new range: ${adapter.format(endDate, "dddd D MMMM YYYY")}`,
        }).should("have.class", "saltCalendarDay-hoveredEnd");

        // Simulate clicking on the end date button to select the range
        cy.findByRole("button", {
          name: `Complete new range: ${adapter.format(endDate, "dddd D MMMM YYYY")}`,
        }).realClick();
        // Verify that the start date button is selected and has the correct class
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(startDate, "dddd D MMMM YYYY")}`,
        })
          .should("exist")
          .and("have.class", "saltCalendarDay-selectedStart");
        // Verify that the dates in the range are selected and have the correct class
        cy.findByRole("button", {
          name: `In selected range: ${adapter.format(adapter.add(startDate, { days: 1 }), "dddd D MMMM YYYY")}`,
        })
          .should("exist")
          .and("have.class", "saltCalendarDay-selectedSpan");
        cy.findByRole("button", {
          name: `End selected range: ${adapter.format(endDate, "dddd D MMMM YYYY")}`,
        })
          .should("exist")
          .and("have.class", "saltCalendarDay-selectedEnd");

        // Simulate clicking on a date outside the range to select a new range
        const newStartDate = adapter.add(startDate, { weeks: 1 });
        cy.findByRole("button", {
          name: adapter.format(newStartDate, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the new date is selected
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(newStartDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Verify that only one date is selected
        cy.findAllByRole("button", {
          name: /^Start selected/,
        }).should("have.length", 1);

        // Simulate clicking on the start date button to select it again
        cy.findByRole("button", {
          name: adapter.format(startDate, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the start date button is selected
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(startDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Verify that only one date is selected
        cy.findAllByRole("button", {
          name: /^Start selected/,
        }).should("have.length", 1);
      });

      it("SHOULD be able to navigate between months through focus", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 2 });

        cy.mount(
          <Calendar selectionVariant="range" defaultVisibleMonth={startDate}>
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
          name: `Complete new range: ${adapter.format(nextMonth, "dddd D MMMM YYYY")}`,
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

      describe("timezone", () => {
        [
          {
            timezone: "default",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "system",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "UTC",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "America/New_York",
            expectedResult: {
              startDate: "2025-01-05T05:00:00.000Z",
              endDate: "2025-01-06T05:00:00.000Z",
            },
          },
          {
            timezone: "Europe/London",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "Asia/Shanghai",
            expectedResult: {
              startDate: "2025-01-04T16:00:00.000Z",
              endDate: "2025-01-05T16:00:00.000Z",
            },
          },
          {
            timezone: "Asia/Kolkata",
            expectedResult: {
              startDate: "2025-01-04T18:30:00.000Z",
              endDate: "2025-01-05T18:30:00.000Z",
            },
          },
        ].forEach(({ timezone, expectedResult }) => {
          if (adapter.lib === "date-fns" && timezone !== "default") {
            return;
          }

          it(`SHOULD render date in the ${timezone} timezone`, () => {
            cy.mount(
              <RangeWithTimezone
                defaultVisibleMonth={
                  adapter.parse("01 Jan 2025", "DD MMM YYYY").date
                }
              />,
            );

            // Simulate selecting timezone
            cy.findByLabelText("timezone dropdown").realClick();
            cy.findByRole("option", { name: timezone }).realHover().realClick();

            // Simulate clicking on a date button to select it
            cy.findByRole("button", {
              name: "Sunday 5 January 2025",
            }).realClick();
            cy.findByRole("button", {
              name: "Monday 6 January 2025",
            }).realClick();

            // Verify the ISO date
            cy.findByTestId("iso-start-date-label").should(
              "have.text",
              expectedResult.startDate,
            );
            cy.findByTestId("iso-end-date-label").should(
              "have.text",
              expectedResult.endDate,
            );
          });
        });
      });
    });
  });
});

describe('GIVEN a Calendar with `selectionVariant="range" and `multiselect`', () => {
  adapters.forEach((adapter: SaltDateAdapter<any>) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      const testDate = {
        startDate: adapter.parse("03/02/2024", "DD/MM/YYYY").date,
        endDate: adapter.parse("05/02/2024", "DD/MM/YYYY").date,
      };

      it("SHOULD move to first selected date of the visible month", () => {
        cy.mount(
          <Calendar
            selectionVariant="range"
            multiselect
            defaultVisibleMonth={testDate.startDate}
            defaultSelectedDate={[
              testDate,
              {
                startDate: adapter.add(testDate.startDate, { days: 3 }),
                endDate: adapter.add(testDate.endDate, { days: 3 }),
              },
              {
                startDate: adapter.add(testDate.startDate, { days: 5 }),
                endDate: adapter.add(testDate.endDate, { days: 5 }),
              },
            ]}
            hideOutOfRangeDates
          >
            <CalendarNavigation />
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
          name: `Start selected range: ${adapter.format(testDate.startDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if selected date is not within the visible month", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            multiselect
            defaultVisibleMonth={todayTestDate}
            defaultSelectedDate={[
              {
                startDate: adapter.subtract(todayTestDate, { months: 2 }),
                endDate: adapter.subtract(todayTestDate, { months: 2 }),
              },
            ]}
            hideOutOfRangeDates
          >
            <CalendarNavigation />
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
          name: `Start new range: ${adapter.format(todayTestDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to today's date if there is not selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            multiselect
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
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
          name: adapter.format(todayTestDate, "dddd D MMMM YYYY"),
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            multiselect
            defaultVisibleMonth={adapter.add(todayTestDate, { months: 1 })}
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
        let startOfMonth = adapter.startOf(todayTestDate, "month");
        startOfMonth = adapter.add(startOfMonth, { months: 2 });
        cy.findByRole("button", {
          name: adapter.format(startOfMonth, "dddd D MMMM YYYY"),
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD allow multiple dates to be selected and unselected", () => {
        const testDate = adapter.today();
        const selectStub = (
          previousSelectedDate: DateRangeSelection[],
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
            const lastEntry = newSelection.length
              ? newSelection[newSelection.length - 1]
              : undefined;

            if (lastEntry?.startDate && !lastEntry.endDate) {
              // If the last entry has only a startDate, set newDate as the endDate
              lastEntry.endDate = newDate;
            } else {
              // Otherwise, add a new entry with startDate set to newDate
              newSelection = [...newSelection, { startDate: newDate }];
            }
          }
          return newSelection;
        };
        cy.mount(
          <Calendar
            selectionVariant="range"
            multiselect
            defaultVisibleMonth={testDate.startDate}
            select={selectStub}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking on the current date button to select it
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the current date button is selected
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate clicking on the next date button to select it
        const nextDay = adapter.add(testDate, { days: 1 });
        cy.findByRole("button", {
          name: adapter.format(nextDay, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: `End selected range: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate clicking on the test date button again to unselect it
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).realClick();
        // Verify that the current date button is unselected
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Verify that the next date button is unselected
        cy.findByRole("button", {
          name: adapter.format(nextDay, "dddd D MMMM YYYY"),
        }).should("exist");

        // Simulate focusing on the current date button
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
        // Simulate pressing the Enter key to select the current date
        cy.realPress("Enter");
        // Simulate pressing the ArrowRight key to move to the next date
        cy.realPress("ArrowRight");
        // Simulate pressing the Enter key to select the next date
        cy.realPress("Enter");
        // Verify that the current date button is selected
        cy.findByRole("button", {
          name: `Start selected range: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: `End selected range: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Simulate pressing the Enter key to select the next date
        cy.realPress("Enter");
        // Verify that the current date button is unselected
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        }).should("exist");
        // Verify that the next date button is unselected
        cy.findByRole("button", {
          name: `Start new range: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");
      });
    });
  });
});
