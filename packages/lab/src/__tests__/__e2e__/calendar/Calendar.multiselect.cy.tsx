import {
  type DateValue,
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  today,
} from "@internationalized/date";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";
import { formatDate } from "@salt-ds/lab";

const { Multiselect } = composeStories(calendarStories);

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

describe("GIVEN a Calendar with multiselect", () => {
  it("SHOULD move to first selected date of the visible month", () => {
    cy.mount(
      <Multiselect
        selectedDate={[
          testDate.add({ days: 8 }),
          testDate.add({ days: 3 }),
          testDate,
        ]}
        defaultVisibleMonth={testDate}
      />,
    );
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
      <Multiselect
        selectedDate={[todayTestDate.subtract({ months: 2 })]}
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
    cy.mount(<Multiselect defaultVisibleMonth={todayTestDate} />);
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
    cy.mount(
      <Multiselect defaultVisibleMonth={todayTestDate.add({ months: 1 })} />,
    );
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
  it("SHOULD allow multiple dates to be selected and unselected", () => {
    cy.mount(<Multiselect defaultVisibleMonth={testDate} />);
    cy.findByRole("button", { name: formatDay(testDate) }).realClick();
    cy.findByRole("button", { name: formatDay(testDate) }).should(
      "have.attr",
      "aria-pressed",
      "true",
    );

    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");

    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("not.have.attr", "aria-pressed");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("not.have.attr", "aria-pressed");

    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("be.focused");
    cy.realPress("Enter");
    cy.realPress("ArrowRight");
    cy.realPress("Enter");
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.attr", "aria-pressed", "true");
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");
  });
});
