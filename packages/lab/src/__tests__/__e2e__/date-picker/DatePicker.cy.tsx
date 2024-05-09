import { composeStories } from "@storybook/react";
import { ChangeEvent } from "react";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import {
  CalendarDate,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";

const composedStories = composeStories(datePickerStories);
const { Default, Range } = composedStories;

const testDate = new CalendarDate(2000, 2, 1);
const testInput = "02-feb-2000";
const rangeTestInput = "02-mar-2000";
const localTimeZone = getLocalTimeZone();
const currentLocale = navigator.languages[0];
const formatDate = (date: DateValue, options?: Intl.DateTimeFormatOptions) => {
  const formatter = new DateFormatter(currentLocale, options);
  return formatter.format(date.toDate(localTimeZone));
};
const formatInput = (date: DateValue): string =>
  new DateFormatter("EN-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date.toDate(localTimeZone));

describe("GIVEN a DatePicker", () => {
  checkAccessibility(composedStories);

  describe("WHEN single datepicker is mounted", () => {
    it("THEN it should mount with the specified defaultStartDate", () => {
      cy.mount(<Default defaultStartDate={testDate} />);
      cy.findByRole("textbox").should("have.value", formatInput(testDate));
    });
    it("THEN should format a valid date with a different format on blur", () => {
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
      };
      cy.mount(<Default defaultStartDate={testDate} onChange={onChange} />);
      cy.findByRole("textbox").click().clear().type(testInput);
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should(
        "have.value",
        formatInput(testDate.add({ days: 1 }))
      );
    });
    it("THEN should error and not format invalid dates on blur", () => {
      cy.mount(<Default defaultStartDate={testDate} />);
      cy.findByRole("textbox").click().clear().type("date");
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should("have.value", "date");
    });
    it("THEN clicking the calendar button should open the panel", () => {
      cy.mount(<Default defaultStartDate={testDate} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
    });
    it("THEN should close the calendar panel once a date is selected", () => {
      cy.mount(<Default defaultStartDate={testDate} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 11 })),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 11 })),
      }).realClick();
      cy.findByRole("application").should("not.exist");
    });
    it("THEN should not open the calendar when disabled", () => {
      cy.mount(<Default defaultStartDate={testDate} disabled />);
      cy.findByRole("button").should("be.disabled");
    });
    it("THEN it should update the selected month when changing selected date", () => {
      cy.mount(<Default defaultStartDate={testDate} />);
      cy.findByRole("textbox").click().clear().type(testInput);
      cy.findByRole("textbox").blur();
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(
          startOfMonth(testDate).add({ months: 1 })
        )}`,
      }).focus();
    });
    it("THEN it should clear the date if an empty input is submitted", () => {
      cy.mount(
        <Default
          defaultStartDate={testDate}
          // @ts-ignore
          CalendarProps={{ visibleMonth: testDate }}
        />
      );
      cy.findByRole("textbox").click().clear();
      cy.findByRole("textbox").blur();
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "not.have.attr",
        "aria-pressed",
        "true"
      );
    });
  });
  describe("WHEN range datepicker is mounted", () => {
    it("THEN it should mount with the specified defaultStartDate and defaultEndDate", () => {
      cy.mount(
        <Range
          defaultStartDate={testDate}
          defaultEndDate={testDate.add({ months: 1 })}
        />
      );
      cy.findAllByRole("textbox")
        .eq(0)
        .should("have.value", formatInput(testDate));
      cy.findAllByRole("textbox")
        .eq(1)
        .should("have.value", formatInput(testDate.add({ months: 1 })));
    });

    it("THEN it should allow selecting start and end date trough input", () => {
      cy.mount(<Range />);
      cy.findAllByRole("textbox").eq(0).clear().click().type(testInput);
      cy.findAllByRole("textbox").eq(1).click().type(rangeTestInput);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("button", {
        pressed: true,
      }).should("have.length", 30);
    });
    it("THEN it should error if on of the dates has the wrong format", () => {
      cy.mount(<Range />);
      cy.findAllByRole("textbox").eq(0).click().type("date");
      cy.findAllByRole("textbox").eq(0).blur();
      cy.findAllByRole("textbox").eq(0).should("have.value", "date");
    });
    it("THEN it should not close the calendar when a start date is selected", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDate(today(localTimeZone).add({ days: 11 })),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDate(today(localTimeZone).add({ days: 11 })),
      }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
    });
    it("THEN it should close the calendar when an end date is selected", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDate(today(localTimeZone).add({ days: 11 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(today(localTimeZone).add({ days: 12 })),
      }).realClick();
      cy.findByRole("application").should("not.exist");
    });
    it("THEN it should move both months forward if selecting a starting date in the second calendar", () => {
      cy.mount(
        <Range
          defaultStartDate={testDate}
          defaultEndDate={testDate.add({ months: 1 })}
        />
      );
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate.add({ months: 1, days: 1 })),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ months: 1, days: 1 })),
      }).realClick();
      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(
          startOfMonth(testDate).add({ months: 1 })
        )}`,
      }).should("exist");
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(
          startOfMonth(testDate).add({ months: 2 })
        )}`,
      }).should("exist");
    });
  });
});
