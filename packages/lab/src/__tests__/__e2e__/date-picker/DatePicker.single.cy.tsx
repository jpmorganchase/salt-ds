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
  SingleControlled,
  SingleWithConfirmation,
  SingleWithCustomPanel,
  SingleWithCustomParser,
  SingleWithMinMaxDate,
  SingleWithToday,
  SingleWithValidation,
} from "@stories/date-picker/date-picker.stories";

const composedStories = composeStories(datePickerStories);
const { Single } = composedStories;

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  const initialDateValue = "05 Jan 2025";
  const initialDate = new CalendarDate(2025, 1, 5);

  const updatedDateValue = "6 Jan 2025";
  const updatedFormattedDateValue = "06 Jan 2025";
  const updatedDate = new CalendarDate(2025, 1, 6);

  const formatDay = (date: DateValue) => {
    return formatDate(date, getCurrentLocale(), {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  it("SHOULD only be able to select a date between min/max", () => {
    cy.mount(<SingleWithMinMaxDate selectionVariant={"single"} />);
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-14")),
    }).should("have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2030-01-15")),
    }).should("not.have.attr", "aria-disabled", "true");
    cy.findByRole("combobox", {
      name: "Year Dropdown",
    }).realClick();
    cy.findByRole("option", {
      name: "2031",
    })
      .realHover()
      .realClick();
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-15")),
    }).should("not.have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-16")),
    }).should("have.attr", "aria-disabled", "true");
    cy.findByRole("button", {
      name: formatDay(parseDate("2031-01-15")),
    }).realClick();
    cy.findByRole("application").should("not.exist");
    cy.findByRole("textbox").should(
      "have.value",
      formatDate(parseDate("2031-01-15")),
    );
  });

  it("SHOULD support validation", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <SingleWithValidation
        selectionVariant={"single"}
        onSelectedDateChange={selectedDateChangeSpy}
      />,
    );
    cy.findByRole("textbox").click().clear().type(initialDateValue);
    cy.realPress("Tab");
    cy.findByRole("textbox").should("have.value", initialDateValue);
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWith",
      initialDate,
    );
    cy.findByRole("textbox").click().clear().type("bad date");
    cy.get("@selectedDateChangeSpy").should("have.been.calledOnce");
    cy.realPress("Tab");
    cy.get("@selectedDateChangeSpy").should("have.been.calledTwice");
    cy.get("@selectedDateChangeSpy").should("have.been.calledWith", null);
  });

  it("SHOULD support custom panel with tenors", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <SingleWithCustomPanel
        selectionVariant={"single"}
        onSelectedDateChange={selectedDateChangeSpy}
      />,
    );
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    cy.findByRole("application").should("exist");
    cy.findByRole("option", {
      name: "15 years",
    })
      .realHover()
      .realClick();
    cy.findByRole("application").should("not.exist");
    cy.realPress("Tab");
    const newDate = today(getLocalTimeZone()).add({ years: 15 });
    cy.get("@selectedDateChangeSpy").should(
      "always.have.been.calledWithMatch",
      newDate,
    );
    cy.findByRole("textbox").should("have.value", formatDate(newDate));
  });

  it("SHOULD support custom panel with Today button", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <SingleWithToday
        selectionVariant={"single"}
        onSelectedDateChange={selectedDateChangeSpy}
      />,
    );
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    cy.findByRole("application").should("exist");
    cy.findByRole("button", { name: "Today" }).realClick();
    cy.findByRole("application").should("not.exist");
    cy.realPress("Tab");
    const newDate = today(getLocalTimeZone());
    cy.get("@selectedDateChangeSpy").should(
      "always.have.been.calledWithMatch",
      newDate,
    );
    cy.findByRole("textbox").should("have.value", formatDate(newDate));
  });

  describe("SHOULD support confirmation", () => {
    it("SHOULD cancel un-confirmed selections", () => {
      const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
      cy.mount(
        <SingleWithConfirmation
          selectionVariant={"single"}
          defaultSelectedDate={initialDate}
          onSelectedDateChange={selectedDateChangeSpy}
        />,
      );
      cy.document()
        .find("input")
        .first()
        .should("have.value", formatDate(initialDate));
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
      const unconfirmedDate = initialDate.add({ days: 1 });
      cy.findByRole("button", { name: formatDay(unconfirmedDate) }).realClick();
      cy.findByRole("application").should("exist");
      cy.document()
        .find("input")
        .should("have.value", formatDate(unconfirmedDate));
      cy.findByRole("button", { name: "Cancel" }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.get("@selectedDateChangeSpy").should("not.have.been.called");
      cy.document().find("input").should("have.value", formatDate(initialDate));
    });
    it("SHOULD apply confirmed selections", () => {
      const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
      cy.mount(
        <SingleWithConfirmation
          selectionVariant={"single"}
          defaultSelectedDate={initialDate}
          onSelectedDateChange={selectedDateChangeSpy}
        />,
      );
      cy.document()
        .find("input")
        .first()
        .should("have.value", formatDate(initialDate));
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
      const unconfirmedDate = initialDate.add({ days: 1 });
      cy.findByRole("button", { name: formatDay(unconfirmedDate) }).realClick();
      cy.findByRole("application").should("exist");
      cy.document()
        .find("input")
        .should("have.value", formatDate(unconfirmedDate));
      cy.findByRole("button", { name: "Apply" }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.get("@selectedDateChangeSpy").should(
        "have.been.calledWith",
        unconfirmedDate,
      );
      cy.document()
        .find("input")
        .should("have.value", formatDate(unconfirmedDate));
    });
  });

  it("SHOULD support custom parsing", () => {
    const selectedDateChangeSpy = cy.stub().as("selectedDateChangeSpy");
    cy.mount(
      <SingleWithCustomParser
        selectionVariant={"single"}
        onSelectedDateChange={selectedDateChangeSpy}
      />,
    );
    cy.findByRole("textbox").click().clear().type(initialDateValue);
    cy.realPress("Tab");
    cy.findByRole("textbox").should("have.value", initialDateValue);
    cy.get("@selectedDateChangeSpy").should(
      "have.been.calledWith",
      initialDate,
    );
    cy.findByRole("textbox").click().clear().type("+7");
    cy.realPress("Tab");
    cy.get("@selectedDateChangeSpy").should("have.been.calledTwice");
    const newDate = initialDate.add({ days: 7 });
    cy.get("@selectedDateChangeSpy").should("have.been.calledWith", newDate);
    cy.document().find("input").should("have.value", formatDate(newDate));
  });

  describe("uncontrolled component", () => {
    it("SHOULD render the default date", () => {
      cy.mount(<Single defaultSelectedDate={initialDate} />);
      cy.findByRole("textbox").should("have.value", initialDateValue);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
      cy.findByRole("button", { name: formatDay(initialDate) }).should(
        "have.attr",
        "aria-pressed",
        "true",
      );
    });
    it("SHOULD be able to select a date", () => {
      cy.mount(<Single defaultSelectedDate={initialDate} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(updatedDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedDate),
      }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.findByRole("textbox").should("have.focus");
      cy.findByRole("textbox").should("have.value", updatedFormattedDateValue);
    });
  });

  describe("controlled component", () => {
    it("SHOULD render the selected date", () => {
      cy.mount(
        <SingleControlled
          selectionVariant={"single"}
          selectedDate={initialDate}
        />,
      );
      cy.findByRole("textbox").should("have.value", initialDateValue);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
      cy.findByRole("button", { name: formatDay(initialDate) }).should(
        "have.attr",
        "aria-pressed",
        "true",
      );
    });
    it("SHOULD be able to select a date", () => {
      cy.mount(
        <SingleControlled
          selectionVariant={"single"}
          selectedDate={initialDate}
        />,
      );
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(updatedDate),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(updatedDate),
      }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.findByRole("textbox").should("have.focus");
      cy.findByRole("textbox").should("have.value", updatedFormattedDateValue);
    });
  });
});
