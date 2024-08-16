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
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to the start date within the visible month
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
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to the end date within the visible month
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
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to today's date
    cy.findByRole("button", {
      name: formatDay(todayTestDate),
    }).should("be.focused");
  });

  it("SHOULD move to today's date if there is not selected date", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(<Range defaultVisibleMonth={todayTestDate} />);
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to today's date
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
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to today's date
    cy.findByRole("button", {
      name: formatDay(todayTestDate),
    }).should("be.focused");
  });

  it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(<Range defaultVisibleMonth={todayTestDate.add({ months: 1 })} />);
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
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to the start of the month
    cy.findByRole("button", {
      name: formatDay(startOfMonth(testDate)),
    }).should("be.focused");
  });

  it("SHOULD allow a range to be selected", () => {
    cy.mount(<Range defaultVisibleMonth={testDate} />);
    // Simulate clicking on the start date button to select it
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    // Verify that the start date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.attr", "aria-pressed", "true");

    // Simulate hovering over the end date button to select the range
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).realHover();
    // Verify that the dates in the range are highlighted
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.class", "saltCalendarDay-hoveredSpan");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).should("have.class", "saltCalendarDay-hoveredSpan");

    // Simulate clicking on the end date button to select the range
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).realClick();
    // Verify that the start date button is selected and has the correct class
    cy.findByRole("button", {
      name: formatDay(testDate),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedStart");
    // Verify that the dates in the range are selected and have the correct class
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

    // Simulate clicking on a date outside the range to select a new range
    cy.findByRole("button", {
      name: formatDay(testDate.add({ weeks: 1 })),
    }).realClick();
    // Verify that the new date is selected
    cy.findByRole("button", {
      name: formatDay(testDate.add({ weeks: 1 })),
    }).should("have.attr", "aria-pressed", "true");
    // Verify that only one date is selected
    cy.findAllByRole("button", {
      pressed: true,
    }).should("have.length", 1);

    // Simulate clicking on the start date button to select it again
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).realClick();
    // Verify that the start date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate),
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
      name: formatDay(testDate),
    })
      .should("have.attr", "aria-pressed", "true")
      .and("have.class", "saltCalendarDay-selectedStart");
    // Verify that the dates in the range are selected and have the correct class
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
