import { composeStories } from "@storybook/react";
import { ChangeEvent } from "react";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import {
  CalendarDate,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

const composedStories = composeStories(datePickerStories);
const { Default, Range } = composedStories;

const testDate = new CalendarDate(2000, 2, 1);
const localTimeZone = getLocalTimeZone();
const currentLocale = navigator.languages[0];
const formatDate = (date: DateValue, options?: Intl.DateTimeFormatOptions) => {
  const formatter = new DateFormatter(currentLocale, options);
  return formatter.format(date.toDate(localTimeZone));
};
describe("GIVEN a DatePicker", () => {
  checkAccessibility(composedStories);

  describe("WHEN single datepicker is mounted", () => {
    it("THEN it should mount with the specified defaultStartDate", () => {
      cy.mount(<Default defaultStartDate={testDate} />);
      cy.findByRole("textbox").should("have.value", "01 Feb 2000");
    });
    it("THEN should format a valid date with a different format on blur", () => {
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
      };
      cy.mount(<Default defaultStartDate={testDate} onChange={onChange} />);
      cy.findByRole("textbox").click().clear().type("02-feb-2000");
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should("have.value", "02 Feb 2000");
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
  });
  describe("WHEN range datepicker is mounted", () => {
    //
  });
});
