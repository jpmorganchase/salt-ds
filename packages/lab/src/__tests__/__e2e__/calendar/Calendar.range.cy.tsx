import {
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  today,
} from "@internationalized/date";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";
import { formatDate } from "@salt-ds/lab";

const { Range } = composeStories(calendarStories);

const testDate = parseDate("2022-02-03");
const localTimeZone = getLocalTimeZone();
const currentLocale = navigator.languages[0];

const formatDay = (date: DateValue) => {
  return formatDate(date, currentLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

describe("GIVEN a Calendar with range selection", () => {
  it("SHOULD move to start date selected if it is within visible month", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(
      <Range
        selectedDate={{
          startDate: startOfMonth(todayTestDate).add({ days: 1 }),
          endDate: endOfMonth(todayTestDate),
        }}
        defaultVisibleMonth={todayTestDate}
      />,
    );
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(startOfMonth(todayTestDate).add({ days: 1 })),
    }).should("be.focused");
  });
  it("SHOULD move to end date selected if it is within visible month and startDate is not", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(
      <Range
        selectedDate={{
          startDate: startOfMonth(todayTestDate).subtract({ months: 1 }),
          endDate: endOfMonth(todayTestDate),
        }}
        defaultVisibleMonth={todayTestDate}
      />,
    );
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(endOfMonth(todayTestDate)),
    }).should("be.focused");
  });
  it("SHOULD move to today's date if selected range is not within the visible month", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(
      <Range
        selectedDate={{
          startDate: todayTestDate.subtract({ months: 2 }),
          endDate: todayTestDate.subtract({
            months: 1,
          }),
        }}
        defaultVisibleMonth={todayTestDate}
      />,
    );
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(todayTestDate),
    }).should("be.focused");
  });
  it("SHOULD move to today's date if there is not selected date", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(<Range defaultVisibleMonth={todayTestDate} />);
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(todayTestDate),
    }).should("be.focused");
  });
  it("SHOULD move to today's date if there is an empty selected range", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(
      <Range
        defaultVisibleMonth={todayTestDate}
        selectedDate={{ startDate: undefined, endDate: undefined }}
      />,
    );
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(todayTestDate),
    }).should("be.focused");
  });
  it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(<Range defaultVisibleMonth={todayTestDate.add({ months: 1 })} />);
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.findByRole("button", {
      name: "Next Month",
    }).realClick();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(startOfMonth(todayTestDate).add({ months: 2 })),
    }).should("be.focused");
  });
  it("SHOULD move to start of the month if the full month is part of a selected range", () => {
    cy.mount(
      <Range
        selectedDate={{
          startDate: testDate.subtract({ months: 2 }),
          endDate: testDate.add({ months: 2 }),
        }}
        defaultVisibleMonth={testDate}
      />,
    );
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(startOfMonth(testDate)),
    }).should("be.focused");
  });
  it("SHOULD allow a range to be selected", () => {
    cy.mount(<Range defaultVisibleMonth={testDate} />);
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.attr", "aria-pressed", "true");

    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).realHover();
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.class", "saltCalendarDay-hoveredSpan");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).should("have.class", "saltCalendarDay-hoveredSpan");

    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedStart");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedSpan");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedEnd");

    cy.findByRole("button", {
      name: formatDay(testDate.add({ weeks: 1 })),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate.add({ weeks: 1 })),
    }).should("have.attr", "aria-pressed", "true");
    cy.findAllByRole("button", {
      pressed: true,
    }).should("have.length", 1);

    cy.findByRole("button", {
      name: formatDay(testDate),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.attr", "aria-pressed", "true");
    cy.findAllByRole("button", {
      pressed: true,
    }).should("have.length", 1);

    cy.realPress("ArrowRight");
    cy.realPress("ArrowRight");
    cy.get(".saltCalendarDay-hoveredSpan").should("not.exist");
    cy.realPress("Enter");
    cy.findByRole("button", {
      name: formatDay(testDate),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedStart");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedSpan");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedEnd");
  });
});
