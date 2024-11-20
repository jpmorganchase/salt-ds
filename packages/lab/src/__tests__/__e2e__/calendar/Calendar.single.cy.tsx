import {
  AdapterDateFns,
  AdapterDayjs,
  AdapterLuxon,
  AdapterMoment,
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/lab";

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

describe("GIVEN a Calendar with single selection", () => {
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
        // Verify that the focus moves to the selected date within the visible month
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD move to selected date when navigating back to selection month", () => {
        cy.mount(
          <Calendar
            selectionVariant="single"
            selectedDate={testDate}
            defaultVisibleMonth={testDate}
          >
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();
        // Simulate clicking the "Previous Month" button
        cy.findByRole("button", {
          name: "Previous Month",
        }).realClick();
        // Simulate focusing on the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).focus();
        // Simulate pressing the Tab key
        cy.realPress("Tab");
        // Verify that the focus moves to the selected date within the visible month
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("be.focused");
      });

      it("SHOULD move to today's date if selected date is not within the visible month", () => {
        const todayTestDate = adapter.today();
        const selectedDate = adapter.subtract(todayTestDate, { months: 2 });
        cy.mount(
          <Calendar
            selectionVariant="single"
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
            selectionVariant="single"
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
            selectionVariant="single"
            defaultVisibleMonth={todayTestDate}
          >
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();
        // Simulate clicking the "Previous Month" button
        cy.findByRole("button", {
          name: "Previous Month",
        }).realClick();
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
        const defaultVisibleMonth = adapter.add(todayTestDate, { months: 1 });
        cy.mount(
          <Calendar
            selectionVariant="single"
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
        const startOfMonth = adapter.startOf(todayTestDate, "month");
        cy.findByRole("button", {
          name: adapter.format(
            adapter.add(startOfMonth, { months: 2 }),
            "DD MMMM YYYY",
          ),
        }).should("be.focused");
      });

      it("SHOULD hover one day when a day is hovered", () => {
        cy.mount(
          <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate hovering over a date button
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realHover({ position: "bottom" });
        // Verify that the date button is hovered
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("have.class", "saltCalendarDay-hovered");

        // Simulate hovering outside the calendar
        cy.get("body").realHover({ position: "topLeft" });
        // Verify that the hovered class is removed
        cy.get(".saltCalendarDay-hovered").should("not.exist");
      });

      it("SHOULD only allow one date to be selected at a time", () => {
        cy.mount(
          <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
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
        let nextDay = adapter.add(testDate, { days: 1 });
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the current date button is unselected
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("not.have.attr", "aria-pressed");
        // Verify that the next date button is selected
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");

        // Simulate pressing the ArrowRight key to move the focus
        cy.realPress("ArrowRight");
        // Simulate pressing the Enter key to select the date
        cy.realPress("Enter");
        // Verify that the next date button is selected
        nextDay = adapter.add(nextDay, { days: 1 });
        cy.findByRole("button", {
          name: adapter.format(nextDay, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");
      });

      it("SHOULD not allow deselection", () => {
        cy.mount(
          <Calendar selectionVariant="single" defaultVisibleMonth={testDate}>
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );
        // Simulate clicking on the current date button to select it
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();
        // Simulate clicking on the current date button again to deselect it
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realClick();
        // Verify that the current date button remains selected
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).should("have.attr", "aria-pressed", "true");
      });
    });
  });
});
