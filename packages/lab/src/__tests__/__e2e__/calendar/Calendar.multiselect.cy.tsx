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

describe("GIVEN a Calendar with multiselect", () => {
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
            selectionVariant="multiselect"
            defaultVisibleMonth={testDate}
            defaultSelectedDate={[
              testDate,
              adapter.add(testDate, { days: 3 }),
              adapter.add(testDate, { days: 8 }),
            ]}
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
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD move to today's date if selected date is not within the visible month", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="multiselect"
            defaultVisibleMonth={todayTestDate}
            defaultSelectedDate={[
              adapter.subtract(todayTestDate, { months: 2 }),
            ]}
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

      it("SHOULD move to today's date if there is not selected date", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="multiselect"
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

      it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
        const todayTestDate = adapter.today();
        cy.mount(
          <Calendar
            selectionVariant="multiselect"
            defaultVisibleMonth={adapter.add(todayTestDate, { months: 1 })}
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
        cy.mount(
          <Calendar
            selectionVariant="multiselect"
            defaultVisibleMonth={testDate}
          >
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking on the current date button to select it
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the current date button is selected
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");

        // Simulate clicking on the next date button to select it
        const nextDay = adapter.add(testDate, { days: 1 });
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");

        // Simulate clicking on the next date button again to unselect it
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).realClick();
        // Simulate clicking on the current date button again to unselect it
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the current date button is unselected
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("not.have.attr", "aria-pressed");
        // Verify that the next date button is unselected
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).should("not.have.attr", "aria-pressed");

        // Simulate focusing on the current date button
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("be.focused");
        // Simulate pressing the Enter key to select the current date
        cy.realPress("Enter");
        // Simulate pressing the ArrowRight key to move to the next date
        cy.realPress("ArrowRight");
        // Simulate pressing the Enter key to select the next date
        cy.realPress("Enter");
        // Verify that the current date button is selected
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");
      });
    });
  });
});
