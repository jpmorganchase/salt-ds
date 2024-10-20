import {
  CalendarDate,
  type DateValue,
  ZonedDateTime,
  parseDate,
  today,
} from "@internationalized/date";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { composeStories } from "@storybook/react";
import React from "react";
import { formatDate } from "../../../calendar";
import { parseZonedDateTime } from "../../../date-input";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
} from "../../../date-picker";

const composedStories = composeStories(datePickerStories);
const {
  Range,
  RangeControlled,
  RangeWithConfirmation,
  RangeWithCustomPanel,
  RangeWithFormField,
  RangeWithMinMaxDate,
} = composedStories;

describe("GIVEN a DatePicker where selectionVariant is range", () => {
  const testLocale = "en-GB";
  const testTimeZone = "Europe/London";

  const initialSingleDateValue = { startDate: "05 Jan 2025" };
  const initialSingleDate = { startDate: new CalendarDate(2025, 1, 5) };

  const initialRangeDateValue = {
    startDate: "05 Jan 2025",
    endDate: "6 Jan 2025",
  };
  const initialRangeDate = {
    startDate: new CalendarDate(2025, 1, 5),
    endDate: new CalendarDate(2025, 1, 6),
  };

  const updatedRangeDateValue = {
    startDate: "5 Jan 2025",
    endDate: "16 Jan 2025",
  };
  const updatedRangeDate = {
    startDate: new CalendarDate(2025, 1, 15),
    endDate: new CalendarDate(2025, 1, 16),
  };

  const formatDay = (date: DateValue) => {
    return formatDate(date, testLocale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  it("SHOULD only be able to select a date between min/max", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <RangeWithMinMaxDate
        defaultSelectedDate={initialRangeDate}
        onSelectedDateChange={selectedDateChangeSpy}
        selectionVariant={"range"}
        locale={testLocale}
      />,
    );
    // Simulate opening the calendar
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    // Verify that the calendar is displayed
    cy.findAllByRole("application").should("have.length", 2);
    // Verify that dates outside the min/max range are disabled
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-14")),
    }).should("have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-15")),
    }).should("not.have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-15")),
    }).should("not.have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-16")),
    }).should("have.attr", "aria-disabled", "true");
    // Simulate selecting a date outside the min/max range
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-14")),
    })
      .realHover()
      .realClick();
    cy.findAllByRole("application").should("have.length", 2);
    cy.get("@selectedDateChangeSpy").should("not.have.been.called");
    // Simulate selecting a date within the min/max range
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-15")),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-15")),
    }).realClick();
    // Verify that the calendar is closed and the selected dates are displayed
    cy.findByRole("application").should("not.exist");
    cy.findByLabelText("Start date").should(
      "have.value",
      formatDate(parseDate("2030-01-15"), testLocale),
    );
    cy.findByLabelText("End date").should(
      "have.value",
      formatDate(parseDate("2031-01-15"), testLocale),
    );
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWith",
      {
        startDate: parseDate("2030-01-15"),
        endDate: parseDate("2031-01-15"),
      },
      { startDate: false, endDate: false },
    );
  });

  it("SHOULD support validation", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <RangeWithFormField
        selectionVariant={"range"}
        onSelectedDateChange={selectedDateChangeSpy}
        locale={testLocale}
      />,
    );
    // Simulate entering a valid start date
    cy.findByLabelText("Start date")
      .click()
      .clear()
      .type(initialSingleDateValue.startDate);
    cy.realPress("Tab");
    cy.findByLabelText("Start date").should(
      "have.value",
      initialRangeDateValue.startDate,
    );
    cy.get("@selectedDateChangeSpy").should("have.been.calledOnce");
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWith",
      {
        startDate: initialRangeDate.startDate,
        endDate: null,
      },
      { startDate: false, endDate: false },
    );
    // Simulate entering an valid end date
    cy.findByLabelText("End date").clear().type(initialRangeDateValue.endDate);
    cy.realPress("Tab");
    cy.get("@selectedDateChangeSpy").should("have.been.calledTwice");
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWith",
      {
        startDate: initialRangeDate.startDate,
        endDate: initialRangeDate.endDate,
      },
      { startDate: false, endDate: false },
    );
    // Simulate entering an invalid end date
    cy.findByLabelText("End date").clear().type("bad date");
    cy.realPress("Tab");
    cy.get("@selectedDateChangeSpy").should("have.been.calledThrice");
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWith",
      {
        startDate: initialRangeDate.startDate,
        endDate: null,
      },
      { startDate: false, endDate: false },
    );
  });

  it("SHOULD support custom panel with tenors", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <RangeWithCustomPanel
        selectionVariant={"range"}
        onSelectedDateChange={selectedDateChangeSpy}
        locale={testLocale}
      />,
    );
    // Simulate opening the calendar
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    // Verify that the calendar is displayed
    cy.findAllByRole("application").should("have.length", 2);
    // Simulate selecting a tenor option
    cy.findByRole("option", {
      name: "15 years",
    })
      .realHover()
      .realClick();
    // Verify that the calendar is closed and the selected dates are displayed
    cy.findByRole("application").should("not.exist");
    cy.realPress("Tab");
    const startDate = today(testTimeZone);
    const endDate = startDate.add({ years: 15 });
    cy.get("@selectedDateChangeSpy").should(
      "always.have.been.calledWithMatch",
      { startDate: startDate, endDate: endDate },
      { startDate: false, endDate: false },
    );
    cy.findByLabelText("Start date").should(
      "have.value",
      formatDate(startDate, testLocale),
    );
    cy.findByLabelText("End date").should(
      "have.value",
      formatDate(endDate, testLocale),
    );
  });

  describe("SHOULD support confirmation", () => {
    it("SHOULD cancel un-confirmed selections", () => {
      const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
      const appliedDateSpy = cy.stub().as("appliedDateSpy");
      const cancelSpy = cy.stub().as("cancelSpy");
      cy.mount(
        <RangeWithConfirmation
          selectionVariant={"range"}
          defaultSelectedDate={initialRangeDate}
          onSelectedDateChange={selectedDateChangeSpy}
          onApply={appliedDateSpy}
          onCancel={cancelSpy}
          locale={testLocale}
        />,
      );
      // Verify that the initial selected dates are displayed
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(initialRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(initialRangeDate.endDate, testLocale),
      );
      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate selecting an unconfirmed date
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).realClick();
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(updatedRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(updatedRangeDate.endDate, testLocale),
      );
      cy.get("@selectedDateChangeSpy").should(
        "have.been.calledWith",
        {
          startDate: updatedRangeDate.startDate,
          endDate: updatedRangeDate.endDate,
        },
        { startDate: false, endDate: false },
      );
      // Simulate clicking the "Cancel" button
      cy.findByRole("button", { name: "Cancel" }).realClick();
      // Verify that the calendar is closed and the initial selected dates are restored
      cy.findByRole("application").should("not.exist");
      cy.get("@appliedDateSpy").should("not.have.been.called");
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(initialRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(initialRangeDate.endDate, testLocale),
      );
      cy.get("@cancelSpy").should("have.been.called");
    });

    it("SHOULD apply confirmed selections", () => {
      const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
      const appliedDateSpy = cy.stub().as("appliedDateSpy");
      const cancelSpy = cy.stub().as("cancelSpy");
      cy.mount(
        <RangeWithConfirmation
          selectionVariant={"range"}
          defaultSelectedDate={initialRangeDate}
          onSelectedDateChange={selectedDateChangeSpy}
          onApply={appliedDateSpy}
          onCancel={cancelSpy}
          locale={testLocale}
        />,
      );
      // Verify that the initial selected dates are displayed
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(initialRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(initialRangeDate.endDate, testLocale),
      );
      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate selecting a new date range
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).realClick();
      // Verify that the new date range is displayed
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(updatedRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(updatedRangeDate.endDate, testLocale),
      );
      cy.get("@selectedDateChangeSpy").should(
        "have.been.calledWith",
        updatedRangeDate,
        { startDate: false, endDate: false },
      );
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate clicking the "Apply" button
      cy.findByRole("button", { name: "Apply" }).realClick();
      // Verify that the calendar is closed and the new date range is applied
      cy.findByRole("application").should("not.exist");
      cy.get("@appliedDateSpy").should(
        "have.been.calledWith",
        updatedRangeDate,
        { startDate: false, endDate: false },
      );
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(updatedRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(updatedRangeDate.endDate, testLocale),
      );
      cy.get("@cancelSpy").should("not.have.been.called");
    });
  });

  describe("uncontrolled component", () => {
    it("SHOULD render the default date", () => {
      cy.mount(
        <Range defaultSelectedDate={initialRangeDate} locale={testLocale} />,
      );
      // Verify that the default selected dates are displayed
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(initialRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(initialRangeDate.endDate, testLocale),
      );
      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
      // Verify that the default selected dates are highlighted in the calendar
      cy.findByRole("button", {
        name: formatDay(initialRangeDate.startDate),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDay(initialRangeDate.endDate),
      }).should("have.attr", "aria-pressed", "true");
    });

    it("SHOULD be able to select a date", () => {
      cy.mount(
        <Range defaultSelectedDate={initialRangeDate} locale={testLocale} />,
      );
      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate selecting a new start date
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).realClick();
      // Simulate selecting a new end date
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).realClick();
      // Verify that the calendar is closed and the new date range is displayed
      cy.findByRole("application").should("not.exist");
      cy.findByRole("button", { name: "Open Calendar" }).should("have.focus");
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(updatedRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(updatedRangeDate.endDate, testLocale),
      );
    });
  });

  describe("controlled component", () => {
    it("SHOULD render the selected date", () => {
      cy.mount(
        <RangeControlled
          selectionVariant={"range"}
          defaultSelectedDate={initialRangeDate}
          locale={testLocale}
        />,
      );
      // Verify that the selected dates are displayed
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(initialRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(initialRangeDate.endDate, testLocale),
      );
      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
      // Verify that the selected dates are highlighted in the calendar
      cy.findByRole("button", {
        name: formatDay(initialRangeDate.startDate),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDay(initialRangeDate.endDate),
      }).should("have.attr", "aria-pressed", "true");
    });

    it("SHOULD be able to select a date", () => {
      cy.mount(
        <RangeControlled
          selectionVariant={"range"}
          defaultSelectedDate={initialRangeDate}
          locale={testLocale}
        />,
      );
      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate selecting a new start date
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).realClick();
      // Simulate selecting a new end date
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).realClick();
      // Verify that the calendar is closed and the new date range is displayed
      cy.findByRole("application").should("not.exist");
      cy.findByRole("button", { name: "Open Calendar" }).should("have.focus");
      cy.findByLabelText("Start date").should(
        "have.value",
        formatDate(updatedRangeDate.startDate, testLocale),
      );
      cy.findByLabelText("End date").should(
        "have.value",
        formatDate(updatedRangeDate.endDate, testLocale),
      );
    });
  });

  it("SHOULD preserve original time during date selection", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    const defaultStartDate = new ZonedDateTime(
      2024,
      12,
      11,
      testTimeZone,
      0,
      9,
      30,
      31,
      32,
    );

    const defaultEndDate = new ZonedDateTime(
      2025,
      13,
      12,
      testTimeZone,
      0,
      10,
      33,
      34,
      35,
    );
    const parse: typeof parseZonedDateTime = (dateTime) =>
      parseZonedDateTime(dateTime, testTimeZone);
    cy.mount(
      <DatePicker
        defaultSelectedDate={{
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }}
        selectionVariant="range"
        onSelectedDateChange={selectedDateChangeSpy}
        locale={testLocale}
        timeZone={testTimeZone}
      >
        <DatePickerRangeInput parse={parse} />
        <DatePickerOverlay>
          <DatePickerRangePanel />
        </DatePickerOverlay>
      </DatePicker>,
    );
    // Simulate entering a valid start date
    cy.findByLabelText("Start date")
      .click()
      .clear()
      .type(initialRangeDateValue.startDate);
    cy.realPress("Tab");
    cy.findByLabelText("Start date").should(
      "have.value",
      initialRangeDateValue.startDate,
    );
    cy.findByLabelText("End date")
      .click()
      .clear()
      .type(initialRangeDateValue.endDate);
    cy.realPress("Tab");
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWithMatch",
      {
        startDate: {
          year: initialRangeDate.startDate.year,
          month: initialRangeDate.startDate.month,
          day: initialRangeDate.startDate.day,
          timeZone: defaultStartDate.timeZone,
          hour: defaultStartDate.hour,
          minute: defaultStartDate.minute,
          second: defaultStartDate.second,
          millisecond: defaultStartDate.millisecond,
        },
        endDate: {
          year: initialRangeDate.endDate.year,
          month: initialRangeDate.endDate.month,
          day: initialRangeDate.endDate.day,
          timeZone: defaultEndDate.timeZone,
          hour: defaultEndDate.hour,
          minute: defaultEndDate.minute,
          second: defaultEndDate.second,
          millisecond: defaultEndDate.millisecond,
        },
      },
      { startDate: false, endDate: false },
    );
  });
});
