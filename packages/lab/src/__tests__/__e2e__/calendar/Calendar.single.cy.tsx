import {
  type DateValue,
  endOfWeek,
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  today,
} from "@internationalized/date";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";
import { formatDate } from "@salt-ds/lab";

const { DisabledDates, Single, UnselectableDates } =
  composeStories(calendarStories);

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

describe("GIVEN a Calendar with single selection", () => {
  it("SHOULD move to selected date if it is within the visible month", () => {
    cy.mount(<Single selectedDate={testDate} defaultVisibleMonth={testDate} />);
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to the selected date within the visible month
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("be.focused");
  });

  it("SHOULD move to selected date when navigating back to selection month", () => {
    cy.mount(<Single selectedDate={testDate} defaultVisibleMonth={testDate} />);
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
      name: formatDay(testDate),
    }).should("be.focused");
  });

  it("SHOULD move to today's date if selected date is not within the visible month", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(
      <Single
        selectedDate={todayTestDate.subtract({ months: 2 })}
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
    cy.mount(<Single defaultVisibleMonth={todayTestDate} />);
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
    cy.mount(<Single defaultVisibleMonth={todayTestDate} />);
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
      name: formatDay(todayTestDate),
    }).should("be.focused");
  });

  it("SHOULD move to start of the month if there is no selected date and today is not within visible month", () => {
    const todayTestDate = today(localTimeZone);
    cy.mount(<Single defaultVisibleMonth={todayTestDate.add({ months: 1 })} />);
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

  it("SHOULD hover one day when a day is hovered", () => {
    cy.mount(<Single defaultVisibleMonth={testDate} />);
    // Simulate hovering over a date button
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).realHover({ position: "bottom" });
    // Verify that the date button is hovered
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.class", "saltCalendarDay-hovered");

    // Simulate hovering outside the calendar
    cy.get("body").realHover({ position: "topLeft" });
    // Verify that the hovered class is removed
    cy.get(".saltCalendarDay-hovered").should("not.exist");
  });

  it("SHOULD only allow one date to be selected at a time", () => {
    cy.mount(<Single defaultVisibleMonth={testDate} />);
    // Simulate clicking on the current date button to select it
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    // Verify that the current date button is selected
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "have.attr",
      "aria-pressed",
      "true",
    );

    // Simulate clicking on the next date button to select it
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).realClick();
    // Verify that the current date button is unselected
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "not.have.attr",
      "aria-pressed",
    );
    // Verify that the next date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");

    // Simulate pressing the ArrowRight key to move the focus
    cy.realPress("ArrowRight");
    // Simulate pressing the Enter key to select the date
    cy.realPress("Enter");
    // Verify that the next date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).should("have.attr", "aria-pressed", "true");
  });

  it("SHOULD not allow deselection", () => {
    cy.mount(<Single defaultVisibleMonth={testDate} />);
    // Simulate clicking on the current date button to select it
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    // Simulate clicking on the current date button again to deselect it
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    // Verify that the current date button remains selected
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "have.attr",
      "aria-pressed",
      "true",
    );
  });

  it("SHOULD not allow selection of disabled dates", () => {
    cy.mount(<DisabledDates defaultVisibleMonth={testDate} />);
    // Verify that a disabled date button is not selectable
    cy.findByRole("button", {
      name: formatDay(parseDate("2022-02-05")),
    }).should("be.disabled");
    cy.findByRole("button", {
      name: formatDay(parseDate("2022-02-05")),
    }).should("have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2022-02-27")),
    }).should("be.disabled");
    cy.findByRole("button", {
      name: formatDay(parseDate("2022-02-27")),
    }).should("have.attr", "aria-disabled", "true");
  });

  it("SHOULD not allow selection of unselectable dates", () => {
    cy.mount(<UnselectableDates defaultVisibleMonth={testDate} />);
    const followingSunday = endOfWeek(testDate, "en-US");
    // Verify that an unselectable date button is not selectable
    cy.findByRole("button", { name: formatDay(followingSunday) }).should(
      "be.disabled",
    );
    cy.findByRole("button", { name: formatDay(followingSunday) }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });
});
