import {
  type DateValue,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";
import { formatDate } from "@salt-ds/lab";

const { OffsetSelection } = composeStories(calendarStories);

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
    cy.mount(<OffsetSelection defaultVisibleMonth={testDate} />);
    const baseDate = testDate.add({ days: 3 });
    const datesInRange = getAllDatesInRange(
      // @ts-ignore
      baseDate,
      // @ts-ignore
      OffsetSelection.args?.endDateOffset(baseDate),
    );
    cy.findByRole("button", {
      name: formatDay(baseDate),
    }).realHover();
    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.class", "saltCalendarDay-hoveredOffset");
    }

    cy.findByRole("button", {
      name: formatDay(baseDate),
    }).realClick();

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

    cy.findByRole("button", {
      name: formatDay(baseDate.add({ weeks: 1 })),
    }).realClick();
    for (const dateInRange of datesInNewRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.attr", "aria-pressed", "true");
    }

    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("not.have.attr", "aria-pressed");
    }

    cy.realPress("ArrowUp");
    cy.realPress("Enter");
    for (const dateInRange of datesInRange) {
      cy.findByRole("button", {
        name: formatDay(dateInRange),
      }).should("have.attr", "aria-pressed", "true");
    }
  });
});
