import { type DateValue, parseDate } from "@internationalized/date";
import { formatDate } from "@salt-ds/lab";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";

const { Offset } = composeStories(calendarStories);

const testDate = parseDate("2022-02-03");
const currentLocale = navigator.languages[0];

const formatDay = (date: DateValue) => {
  return formatDate(date, currentLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function getAllDatesInRange(startDate: DateValue, endDate: DateValue) {
  const dates = [];

  let currentDate = startDate;
  while (currentDate.compare(endDate) <= 0) {
    dates.push(startDate);
    currentDate = currentDate.add({ days: 1 });
  }
  return dates;
}

describe("GIVEN a Calendar with offset selection", () => {
  it("SHOULD allow a defined range to be selected", () => {
    cy.mount(<Offset defaultVisibleMonth={testDate} />);
    const baseDate = testDate.add({ days: 3 });
    const datesInRange = getAllDatesInRange(
      // @ts-ignore
      baseDate,
      // @ts-ignore
      OffsetSelection.args?.endDateOffset(baseDate),
    );
    // Simulate hovering over the base date button
    cy.findByRole("button", {
      name: formatDay(baseDate),
    }).realHover();
    // Verify that all dates in the range are highlighted
    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.class", "saltCalendarDay-hoveredOffset");
    }

    // Simulate clicking the base date button to select the range
    cy.findByRole("button", {
      name: formatDay(baseDate),
    }).realClick();
    // Verify that all dates in the range are selected
    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.attr", "aria-pressed", "true");
    }

    const newBaseDate = baseDate.add({ weeks: 1 });
    const datesInNewRange = getAllDatesInRange(
      newBaseDate,
      // @ts-ignore
      OffsetSelection.args?.endDateOffset(newBaseDate),
    );

    // Simulate clicking a new base date button to select a new range
    cy.findByRole("button", {
      name: formatDay(baseDate.add({ weeks: 1 })),
    }).realClick();
    // Verify that all dates in the new range are selected
    for (const dateInRange of datesInNewRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.attr", "aria-pressed", "true");
    }
    // Verify that the previous range is unselected
    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("not.have.attr", "aria-pressed");
    }

    // Simulate pressing the ArrowUp key to move the focus
    cy.realPress("ArrowUp");
    // Simulate pressing the Enter key to select the range
    cy.realPress("Enter");
    // Verify that the original range is selected again
    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.attr", "aria-pressed", "true");
    }
  });
});
