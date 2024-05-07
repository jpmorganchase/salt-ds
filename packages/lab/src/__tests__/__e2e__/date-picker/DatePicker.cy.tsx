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
} from "@internationalized/date";

const composedStories = composeStories(datePickerStories);
const { Default, Range } = composedStories;

const testDate = new CalendarDate(2000, 2, 1);
const testInput = "02-feb-2000";
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
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
      };
      cy.mount(<Default defaultStartDate={testDate} onChange={onChange} />);
      cy.findByRole("textbox").click().clear().type("01 0ct 2000");
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should("have.value", "01 0ct 2000");
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
  });
});
