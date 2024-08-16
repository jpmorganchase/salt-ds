import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { composeStories } from "@storybook/react";
import {
  CalendarDate,
  type DateValue,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import { formatDate, getCurrentLocale } from "../../../calendar";
import {
  RangeControlled,
  RangeWithConfirmation,
  RangeWithCustomPanel,
  RangeWithMinMaxDate,
  RangeWithValidation, SingleControlled, SingleWithConfirmation,
} from "@stories/date-picker/date-picker.stories";

const composedStories = composeStories(datePickerStories);
const { Range } = composedStories;

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  const initialSingleDateValue = { startDate: "05 Jan 2025" };
  const initialSingleDate = { startDate: new CalendarDate(2025, 1, 5) };

  const initialRangeDateValue = { startDate: "05 Jan 2025", endDate: "6 Jan 2025" };
  const initialRangeDate = {
    startDate: new CalendarDate(2025, 1, 5),
    endDate: new CalendarDate(2025, 1, 6),
  };

  const updatedRangeDateValue = { startDate: "5 Jan 2025", endDate: "16 Jan 2025" };
  const updatedRangeDate = {
    startDate: new CalendarDate(2025, 1, 15),
    endDate: new CalendarDate(2025, 1, 16),
  };

  const formatDay = (date: DateValue) => {
    return formatDate(date, getCurrentLocale(), {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  it("SHOULD only be able to select a date between min/max", () => {
    cy.mount(<RangeWithMinMaxDate selectionVariant={"range"} />);
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
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
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-15")),
    }).realClick();
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-15")),
    }).realClick();
    cy.findByRole("application").should("not.exist");
    cy.findByLabelText("Start date").should(
      "have.value",
      formatDate(parseDate("2030-01-15")),
    );
    cy.findByLabelText("End date").should(
      "have.value",
      formatDate(parseDate("2031-01-15")),
    );
  });

  it("SHOULD support validation", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <RangeWithValidation
        selectionVariant={"range"}
        onSelectedDateChange={selectedDateChangeSpy}
      />,
    );
    cy.findByLabelText("Start date").click().clear().type(initialSingleDateValue.startDate);
    cy.realPress("Tab");
    cy.findByLabelText("Start date").should("have.value", initialSingleDateValue.startDate);
    cy.get("@selectedDateChangeSpy").should("have.been.calledWith", {
      startDate: initialSingleDate.startDate,
      endDate: undefined,
    });
    cy.findByLabelText("Start date").clear().type("bad date");
    cy.get("@selectedDateChangeSpy").should("have.been.calledOnce");
    cy.realPress("Tab");
    cy.get("@selectedDateChangeSpy").should("have.been.calledTwice");
    cy.get("@selectedDateChangeSpy").should("have.been.calledWith", null);
  });

  it("SHOULD support custom panel with tenors", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <RangeWithCustomPanel
        selectionVariant={"range"}
        onSelectedDateChange={selectedDateChangeSpy}
      />,
    );
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    cy.findAllByRole("application").should("have.length", 2);
    cy.findByRole("option", {
      name: "15 years",
    })
      .realHover()
      .realClick();
    cy.findByRole("application").should("not.exist");
    cy.realPress("Tab");
    const startDate =  today(getLocalTimeZone());
    const endDate =startDate.add({ years: 15 });
    cy.get("@selectedDateChangeSpy").should(
      "always.have.been.calledWithMatch",
      { startDate: startDate, endDate: endDate },
    );
    cy.findByLabelText("Start date").should(
      "have.value",
      formatDate(startDate),
    );
    cy.findByLabelText("End date").should("have.value", formatDate(endDate));
  });

  describe("SHOULD support confirmation", () => {
    it("SHOULD cancel un-confirmed selections", () => {
      const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
      cy.mount(
        <RangeWithConfirmation
          selectionVariant={"range"}
          defaultSelectedDate={initialRangeDate}
          onSelectedDateChange={selectedDateChangeSpy}
        />,
      );
      cy.findByLabelText("Start date").should("have.value", formatDate(initialRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(initialRangeDate.endDate));
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      const unconfirmedDate = initialRangeDate.startDate.add({ days: 1 });
      cy.findByRole("button", { name: formatDay(unconfirmedDate) }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByLabelText("Start date").should("have.value", formatDate(unconfirmedDate));
      cy.findByRole("button", { name: "Cancel" }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.get("@selectedDateChangeSpy").should("not.have.been.called");
      cy.findByLabelText("Start date").should("have.value", formatDate(initialRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(initialRangeDate.endDate));
    });
    it("SHOULD apply confirmed selections", () => {
      const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
      cy.mount(
        <RangeWithConfirmation
          selectionVariant={"range"}
          defaultSelectedDate={initialRangeDate}
          onSelectedDateChange={selectedDateChangeSpy}
        />,
      );
      cy.findByLabelText("Start date").should("have.value", formatDate(initialRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(initialRangeDate.endDate));
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      const unconfirmedDate = { startDate: initialRangeDate.startDate.add({ days: 1 }), endDate: initialRangeDate.startDate.add({ days: 2 })};
      cy.findByRole("button", { name: formatDay(unconfirmedDate.startDate) }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByRole("button", { name: formatDay(unconfirmedDate.endDate) }).realClick();
      cy.findByLabelText("Start date").should("have.value", formatDate(unconfirmedDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(unconfirmedDate.endDate));
      cy.findByRole("button", { name: "Apply" }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.get("@selectedDateChangeSpy").should(
        "have.been.calledWith",
        unconfirmedDate,
      );
      cy.findByLabelText("Start date").should("have.value", formatDate(unconfirmedDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(unconfirmedDate.endDate));
    });
  });
  describe("uncontrolled component", () => {
    it("SHOULD render the default date", () => {
      cy.mount(<Range defaultSelectedDate={initialRangeDate} />);
      cy.findByLabelText("Start date").should("have.value", formatDate(initialRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(initialRangeDate.endDate));
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByRole("button", { name: formatDay(initialRangeDate.startDate) }).should(
        "have.attr",
        "aria-pressed",
        "true",
      );
      cy.findByRole("button", { name: formatDay(initialRangeDate.endDate) }).should(
        "have.attr",
        "aria-pressed",
        "true",
      );
    });
    it("SHOULD be able to select a date", () => {
      cy.mount(<Range defaultSelectedDate={initialRangeDate} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).realClick();
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.findByLabelText("End date").should("have.focus");
      cy.findByLabelText("Start date").should("have.value", formatDate(updatedRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(updatedRangeDate.endDate));
    });
  });
  describe("controlled component", () => {
    it("SHOULD render the selected date", () => {
      cy.mount(
        <RangeControlled
          selectionVariant={"range"}
          selectedDate={initialRangeDate}
        />,
      );
      cy.findByLabelText("Start date").should("have.value", formatDate(initialRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(initialRangeDate.endDate));
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByRole("button", { name: formatDay(initialRangeDate.startDate) }).should(
        "have.attr",
        "aria-pressed",
        "true",
      );
      cy.findByRole("button", { name: formatDay(initialRangeDate.endDate) }).should(
        "have.attr",
        "aria-pressed",
        "true",
      );
    });
    it("SHOULD be able to select a date", () => {
      cy.mount(
        <RangeControlled
          selectionVariant={"range"}
          selectedDate={initialRangeDate}
        />,
      );
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.startDate),
      }).realClick();
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedRangeDate.endDate),
      }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.findByLabelText("End date").should("have.focus");
      cy.findByLabelText("Start date").should("have.value", formatDate(updatedRangeDate.startDate));
      cy.findByLabelText("End date").should("have.value", formatDate(updatedRangeDate.endDate));
    });
  });

});
