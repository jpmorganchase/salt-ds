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
  type SingleDateSelection,
} from "@salt-ds/lab";

import * as dateInputStories from "@stories/calendar/calendar.stories";

const {
  // Storybook wraps components in it's own LocalizationProvider, so do not compose Stories
  SingleWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: storybook stories
} = dateInputStories as any;

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

describe('GIVEN a Calendar with `selectionVariant="single"`', () => {
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

      it("SHOULD move to selected date if it is within the visible month", () => {
        cy.mount(
          <Calendar
            selectionVariant="single"
            selectedDate={testDate}
            defaultVisibleMonth={testDate}
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
        // Verify that the focus moves to the selected date within the visible month
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
      });

      it("SHOULD move to selected date when navigating back to selection month", () => {
        cy.mount(
          <Calendar
            selectionVariant="single"
            selectedDate={testDate}
            defaultVisibleMonth={testDate}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Simulate clicking the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(testDate, { months: 1 }),
            "dddd D MMMM YYYY",
          ),
        }).should("exist");
        // Simulate clicking the "Previous Month" button
        cy.findByRole("button", {
          name: "Previous Month",
        }).realClick();
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the selected date within the visible month
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
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
            selectionVariant="single"
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

      it("SHOULD move to today's date if there is no selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="single"
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

      it("SHOULD move to today's date if there is no selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="single"
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        cy.findByRole("button", {
          name: adapter.format(todayTestDate, "dddd D MMMM YYYY"),
        }).should("exist");
        // Simulate clicking the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(todayTestDate, { months: 1 }),
            "dddd D MMMM YYYY",
          ),
        }).should("exist");
        // Simulate clicking the "Previous Month" button
        cy.findByRole("button", {
          name: "Previous Month",
        }).realClick();
        cy.findByRole("button", {
          name: adapter.format(todayTestDate, "dddd D MMMM YYYY"),
        }).should("exist");
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
        const defaultVisibleMonth = adapter.add(todayTestDate, { months: 1 });
        cy.mount(
          <Calendar
            selectionVariant="single"
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
        const startOfMonth = adapter.startOf(todayTestDate, "month");
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

      it("SHOULD only allow one date to be selected at a time", () => {
        cy.mount(
          <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
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
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate clicking on the next date button to select it
        let nextDay = adapter.add(testDate, { days: 1 });
        cy.findByRole("button", {
          name: adapter.format(nextDay, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the current date button is unselected
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        }).should("exist");
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate pressing the ArrowRight key to move the focus
        cy.realPress("ArrowRight");
        // Simulate pressing the Enter key to select the date
        cy.realPress("Enter");
        // Verify that the next date button is selected
        nextDay = adapter.add(nextDay, { days: 1 });
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");
      });

      it("SHOULD be able to navigate between months through focus", () => {
        cy.mount(
          <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );

        // Simulate pressing the ArrowDown key to move the next month
        const weekbeforeEndOfMonth = adapter.subtract(
          adapter.endOf(testDate, "month"),
          { days: 6 },
        );
        const nextMonth = adapter.startOf(
          adapter.add(testDate, { months: 1 }),
          "month",
        );
        cy.findByRole("button", {
          name: adapter.format(weekbeforeEndOfMonth, "dddd D MMMM YYYY"),
        }).realClick();
        cy.realPress("ArrowDown");
        // Verify that the focus moves to the next month
        cy.findByRole("button", {
          name: adapter.format(nextMonth, "dddd D MMMM YYYY"),
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
          name: `Selected date: ${adapter.format(weekbeforeEndOfMonth, "dddd D MMMM YYYY")}`,
        })
          .should(($button) =>
            expect($button.attr("class")).to.match(/saltCalendarDay-focused/),
          )
          .should("be.focused");
        // Verify that the calendar navigates to the next month
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          adapter.format(testDate, "MMM"),
        );
      });

      it("SHOULD not allow deselection", () => {
        cy.mount(
          <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
            <CalendarNavigation />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking on the current date button to select it
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        }).realClick();
        // Simulate clicking on the current date button again to deselect it
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).realClick();
        // Verify that the current date button remains selected
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
      });

      describe("timezone", () => {
        [
          { timezone: "default", expectedResult: "2025-01-05T00:00:00.000Z" },
          { timezone: "system", expectedResult: "2025-01-05T00:00:00.000Z" },
          { timezone: "UTC", expectedResult: "2025-01-05T00:00:00.000Z" },
          {
            timezone: "America/New_York",
            expectedResult: "2025-01-05T05:00:00.000Z",
          },
          {
            timezone: "Europe/London",
            expectedResult: "2025-01-05T00:00:00.000Z",
          },
          {
            timezone: "Asia/Shanghai",
            expectedResult: "2025-01-04T16:00:00.000Z",
          },
          {
            timezone: "Asia/Kolkata",
            expectedResult: "2025-01-04T18:30:00.000Z",
          },
        ].forEach(({ timezone, expectedResult }) => {
          if (adapter.lib === "date-fns" && timezone !== "default") {
            return;
          }
          it(`SHOULD render date in the ${timezone} timezone`, () => {
            cy.mount(
              <SingleWithTimezone
                defaultVisibleMonth={
                  adapter.parse("01 Jan 2025", "DD MMM YYYY").date
                }
              />,
            );
            // Simulate selecting timezone
            cy.findByLabelText("timezone dropdown").realClick();
            cy.findByRole("option", { name: timezone }).realHover().realClick();
            cy.findByLabelText("timezone dropdown").should(
              "have.text",
              timezone,
            );
            // Simulate clicking on a date button to select it
            cy.findByRole("button", {
              name: "Sunday 5 January 2025",
            }).realClick();
            // Verify the ISO date
            cy.findByTestId("iso-date-label").should(
              "have.text",
              expectedResult,
            );
          });
        });
      });
    });
  });
});

describe('GIVEN a Calendar with `selectionVariant="single" and `multiselect`', () => {
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

      it("SHOULD move to first selected date of the visible month", () => {
        cy.mount(
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
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the first selected date of the visible month
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
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
            selectionVariant="single"
            multiselect
            defaultVisibleMonth={todayTestDate}
            defaultSelectedDate={[
              adapter.subtract(todayTestDate, { months: 2 }),
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
          name: adapter.format(todayTestDate, "dddd D MMMM YYYY"),
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
            selectionVariant="single"
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
            selectionVariant="single"
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
          previousSelectedDate: SingleDateSelection<DateFrameworkType>[],
          newDate: DateFrameworkType,
        ) => {
          let newSelection = previousSelectedDate.filter((previousDate) => {
            // Check if newDate is not between startDate and endDate
            return !(adapter.compare(previousDate, newDate) === 0);
          });

          if (newSelection.length === previousSelectedDate.length) {
            newSelection = [...newSelection, newDate];
          }

          return newSelection;
        };
        cy.mount(
          <Calendar
            selectionVariant="single"
            multiselect
            defaultVisibleMonth={testDate}
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
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate clicking on the next date button to select it
        const nextDay = adapter.add(testDate, { days: 1 });
        cy.findByRole("button", {
          name: adapter.format(nextDay, "dddd D MMMM YYYY"),
        }).realClick();
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");

        // Simulate clicking on the next date button again to unselect it
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).realClick();
        // Simulate clicking on the current date button again to unselect it
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).realClick();
        // Verify that the current date button is unselected
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
        }).should("exist");
        // Verify that the next date button is unselected
        cy.findByRole("button", {
          name: adapter.format(nextDay, "dddd D MMMM YYYY"),
        }).should("exist");

        // Simulate focusing on the current date button
        cy.findByRole("button", {
          name: adapter.format(testDate, "dddd D MMMM YYYY"),
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
          name: `Selected date: ${adapter.format(testDate, "dddd D MMMM YYYY")}`,
        }).should("exist");
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(nextDay, "dddd D MMMM YYYY")}`,
        }).should("exist");
      });
    });
  });
});
