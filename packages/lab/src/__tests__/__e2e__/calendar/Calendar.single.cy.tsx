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
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("be.focused");
  });
  it("SHOULD move to selected date when navigating back to selection month", () => {
    cy.mount(<Single selectedDate={testDate} defaultVisibleMonth={testDate} />);
    cy.findByRole("button", {
      name: "Next Month",
    }).realClick();
    cy.findByRole("button", {
      name: "Previous Month",
    }).realClick();
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    cy.realPress("Tab");
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
    cy.mount(<Single defaultVisibleMonth={todayTestDate} />);
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
    cy.mount(<Single defaultVisibleMonth={todayTestDate} />);
    cy.findByRole("button", {
      name: "Next Month",
    }).realClick();
    cy.findByRole("button", {
      name: "Previous Month",
    }).realClick();
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
    cy.mount(<Single defaultVisibleMonth={todayTestDate.add({ months: 1 })} />);
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
  it("SHOULD hover one day when a day is hovered", () => {
    cy.mount(<Single defaultVisibleMonth={testDate} />);
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).realHover({ position: "bottom" });
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.class", "saltCalendarDay-hovered");

    cy.get("body").realHover({ position: "topLeft" });
    cy.get(".saltCalendarDay-hovered").should("not.exist");
  });
  it("SHOULD only allow one date to be selected at a time", () => {
    cy.mount(<Single defaultVisibleMonth={testDate} />);
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "have.attr",
      "aria-pressed",
      "true",
    );

    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).realClick();
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "not.have.attr",
      "aria-pressed",
    );
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");
    cy.realPress("ArrowRight");
    cy.realPress("Enter");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 2 })),
    }).should("have.attr", "aria-pressed", "true");
  });

  it("SHOULD not allow deselection", () => {
    cy.mount(<Single defaultVisibleMonth={testDate} />);
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "have.attr",
      "aria-pressed",
      "true",
    );
  });
  it("SHOULD not allow selection of disabled dates", () => {
    cy.mount(<DisabledDates defaultVisibleMonth={testDate} />);
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
