import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters";
import { AdapterDayjs } from "@salt-ds/date-adapters";
import { AdapterLuxon } from "@salt-ds/date-adapters";
import { AdapterMoment } from "@salt-ds/date-adapters";
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

function getAllDatesInRange(
  adapter: SaltDateAdapter<DateFrameworkType>,
  startDate: DateFrameworkType,
  endDate: DateFrameworkType,
) {
  const dates = [];
  let currentDate = startDate;
  while (adapter.compare(currentDate, endDate) <= 0) {
    dates.push(startDate);
    currentDate = adapter.add(currentDate, { days: 1 });
  }
  return dates;
}

describe("GIVEN a Calendar with offset selection", () => {
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
        cy.mount(
          <Calendar selectionVariant="offset" defaultVisibleMonth={testDate}>
            <CalendarNavigation />
            <CalendarWeekHeader />
            <CalendarGrid />
          </Calendar>,
        );

        const offsetDate = adapter.add(testDate, { days: 4 });
        const datesInRange = getAllDatesInRange(adapter, testDate, offsetDate);

        // Simulate hovering over the base date button
        cy.findByRole("button", {
          name: adapter.format(testDate, "DD MMMM YYYY"),
        }).realHover();

        // Verify that all dates in the range are highlighted
        datesInRange.forEach((dateInRange) => {
          cy.findByRole("button", {
            name: adapter.format(dateInRange, "DD MMMM YYYY"),
          }).should("have.class", "saltCalendarDay-hoveredOffset");
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
