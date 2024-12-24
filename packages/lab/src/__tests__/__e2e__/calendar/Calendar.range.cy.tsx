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
} from "@salt-ds/lab";

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

describe("GIVEN a Calendar with range selection", () => {
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
        // Verify that the focus moves to the start date within the visible month
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        }).should("be.focused");
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
        // Verify that the focus moves to the end date within the visible month
        cy.findByRole("button", {
          name: adapter.format(endDate, "DD MMMM YYYY"),
        }).should("be.focused");
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

      it("SHOULD move to today's date if there is not selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={todayTestDate}
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

      it("SHOULD move to today's date if there is an empty selected range", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={todayTestDate}
            selectedDate={{ startDate: undefined, endDate: undefined }}
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
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const defaultVisibleMonth = adapter.add(startOfMonth, { months: 1 });
        cy.mount(
          <Calendar
            selectionVariant="range"
            defaultVisibleMonth={defaultVisibleMonth}
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
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startOfMonth, { months: 2 }),
            "DD MMMM YYYY",
          ),
        }).should("be.focused");
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
        // Verify that the focus moves to the start of the month
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD allow a range to be selected", () => {
        const todayTestDate = adapter.today();
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        const startDate = adapter.subtract(startOfMonth, { months: 2 });
        const endDate = adapter.add(startDate, { days: 2 });

        cy.mount(
          <Calendar selectionVariant="range" defaultVisibleMonth={startDate}>
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking on the start date button to select it
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the start date button is selected
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");

        // Simulate hovering over the end date button to select the range
        cy.findByRole("button", {
          name: adapter.format(endDate, "DD MMMM YYYY"),
        }).realHover();
        // Verify that the dates in the range are highlighted
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startDate, { days: 1 }),
            "DD MMMM YYYY",
          ),
        }).should("have.class", "saltCalendarDay-hoveredSpan");
        cy.findByRole("button", {
          name: adapter.format(endDate, "DD MMMM YYYY"),
        }).should("have.class", "saltCalendarDay-hoveredSpan");

        // Simulate clicking on the end date button to select the range
        cy.findByRole("button", {
          name: adapter.format(endDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the start date button is selected and has the correct class
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        })
          .should("have.attr", "aria-pressed", "true")
          .and("have.class", "saltCalendarDay-selectedStart");
        // Verify that the dates in the range are selected and have the correct class
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startDate, { days: 1 }),
            "DD MMMM YYYY",
          ),
        })
          .should("have.attr", "aria-pressed", "true")
          .and("have.class", "saltCalendarDay-selectedSpan");
        cy.findByRole("button", {
          name: adapter.format(endDate, "DD MMMM YYYY"),
        })
          .should("have.attr", "aria-pressed", "true")
          .and("have.class", "saltCalendarDay-selectedEnd");

        // Simulate clicking on a date outside the range to select a new range
        const newStartDate = adapter.add(startDate, { weeks: 1 });
        cy.findByRole("button", {
          name: adapter.format(newStartDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the new date is selected
        cy.findByRole("button", {
          name: adapter.format(newStartDate, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");
        // Verify that only one date is selected
        cy.findAllByRole("button", {
          pressed: true,
        }).should("have.length", 1);

        // Simulate clicking on the start date button to select it again
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the start date button is selected
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");
        // Verify that only one date is selected
        cy.findAllByRole("button", {
          pressed: true,
        }).should("have.length", 1);

        // Simulate pressing the ArrowRight key to move the focus
        cy.realPress("ArrowRight");
        cy.realPress("ArrowRight");
        // Verify that the hovered span class is removed
        cy.get(".saltCalendarDay-hoveredSpan").should("not.exist");
        // Simulate pressing the Enter key to select the range
        cy.realPress("Enter");
        // Verify that the start date button is selected and has the correct class
        cy.findByRole("button", {
          name: adapter.format(startDate, "DD MMMM YYYY"),
        })
          .should("have.attr", "aria-pressed", "true")
          .and("have.class", "saltCalendarDay-selectedStart");
        // Verify that the dates in the range are selected and have the correct class
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startDate, { days: 1 }),
            "DD MMMM YYYY",
          ),
        })
          .should("have.attr", "aria-pressed", "true")
          .and("have.class", "saltCalendarDay-selectedSpan");
        cy.findByRole("button", {
          name: adapter.format(endDate, "DD MMMM YYYY"),
        })
          .should("have.attr", "aria-pressed", "true")
          .and("have.class", "saltCalendarDay-selectedEnd");
      });
    });
  });
});
