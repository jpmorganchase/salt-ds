import {
  type DateValue,
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  today,
} from "@internationalized/date";
import { formatDate } from "@salt-ds/lab";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";

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
    // Simulate focusing on the "Next Month" button
    cy.findByRole("button", {
      name: "Next Month",
    }).focus();
    // Simulate pressing the Tab key
    cy.realPress("Tab");
    // Verify that the focus moves to the first selected date of the visible month
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
    cy.mount(<Multiselect defaultVisibleMonth={todayTestDate} />);
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
    cy.mount(
      <Multiselect defaultVisibleMonth={todayTestDate.add({ months: 1 })} />,
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
    cy.findByRole("button", {
      name: formatDay(startOfMonth(todayTestDate).add({ months: 2 })),
    }).should("be.focused");
  });

  it("SHOULD allow multiple dates to be selected and unselected", () => {
    cy.mount(<Multiselect defaultVisibleMonth={testDate} />);
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
    // Verify that the next date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");

    // Simulate clicking on the next date button again to unselect it
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).realClick();
    // Simulate clicking on the current date button again to unselect it
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).realClick();
    // Verify that the current date button is unselected
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("not.have.attr", "aria-pressed");
    // Verify that the next date button is unselected
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("not.have.attr", "aria-pressed");

    // Simulate focusing on the current date button
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("be.focused");
    // Simulate pressing the Enter key to select the current date
    cy.realPress("Enter");
    // Simulate pressing the ArrowRight key to move to the next date
    cy.realPress("ArrowRight");
    // Simulate pressing the Enter key to select the next date
    cy.realPress("Enter");
    // Verify that the current date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate),
    }).should("have.attr", "aria-pressed", "true");
    // Verify that the next date button is selected
    cy.findByRole("button", {
      name: formatDay(testDate.add({ days: 1 })),
    }).should("have.attr", "aria-pressed", "true");
  });
});
