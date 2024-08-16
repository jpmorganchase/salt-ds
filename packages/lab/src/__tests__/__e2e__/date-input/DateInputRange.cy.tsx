import { SyntheticEvent, useState } from "react";
import { CalendarDate, DateValue } from "@internationalized/date";
import { composeStories } from "@storybook/react";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { DateRangeSelection } from "../../../calendar";
const composedStories = composeStories(dateInputStories);
const { Range } = composedStories;

describe("GIVEN a DateInputRange", () => {
  const initialDateValue = { startDate: "05 Jan 2025", endDate: "06 Feb 2026" };
  const initialDate = {
    startDate: new CalendarDate(2025, 1, 5),
    endDate: new CalendarDate(2026, 2, 6),
  };

  const updatedDateValue = { startDate: "1 Nov 2027", endDate: "2 Dec 2028" };
  const updatedFormattedDateValue = {
    startDate: "01 Nov 2027",
    endDate: "02 Dec 2028",
  };
  const updatedDate = {
    startDate: new CalendarDate(2027, 11, 1),
    endDate: new CalendarDate(2028, 12, 2),
  };

  const setupSpies = () => {
    const startInputChangeSpy = cy.stub().as("startInputChangeSpy");
    const endInputChangeSpy = cy.stub().as("endInputChangeSpy");
    const dateChangeSpy = cy.stub().as("dateChangeSpy");
    const dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");

    return {
      startInputChangeSpy,
      endInputChangeSpy,
      dateChangeSpy,
      dateValueChangeSpy,
    };
  };

  it("SHOULD render value, even when not a valid date", () => {
    cy.mount(
      <Range
        defaultValue={{
          startDate: "start date value",
          endDate: "end date value",
        }}
      />,
    );
    cy.findByLabelText("Start date").should("have.value", "start date value");
    cy.findByLabelText("End date").should("have.value", "end date value");
  });

  it("SHOULD support custom parser", () => {
    const parseSpy = cy.stub().as("parseSpy");
    const customParser = (
      inputDate: string | undefined,
    ): DateValue | undefined => {
      const parsedAsDate = updatedDate.startDate;
      parseSpy(inputDate);
      return parsedAsDate;
    };

    cy.mount(
      <Range defaultValue={{ startDate: "text value" }} parse={customParser} />,
    );
    cy.findByLabelText("Start date")
      .click()
      .clear()
      .type("new start date value");
    cy.realPress("Tab");
    cy.findByLabelText("Start date").should(
      "have.value",
      updatedFormattedDateValue.startDate,
    );
    cy.get("@parseSpy").should(
      "have.been.calledWithMatch",
      "new start date value",
    );
    cy.findByLabelText("End date").click().clear().type("new end date value");
    cy.realPress("Tab");
    cy.findByLabelText("End date").should(
      "have.value",
      updatedFormattedDateValue.startDate,
    );
    cy.get("@parseSpy").should(
      "have.been.calledWithMatch",
      "new end date value",
    );
  });

  it("SHOULD support custom formatter", () => {
    const formatSpy = cy.stub().as("formatSpy");
    const customFormatter = (
      dateToFormat: DateValue | null | undefined,
    ): string => {
      formatSpy(dateToFormat);
      return "formatted date";
    };

    cy.mount(
      <Range
        defaultValue={{ startDate: "text value" }}
        formatDate={customFormatter}
      />,
    );
    cy.findByLabelText("Start date")
      .click()
      .clear()
      .type(initialDateValue.startDate);
    cy.realPress("Tab");
    cy.findByLabelText("Start date").should("have.value", "formatted date");
    cy.get("@formatSpy").should(
      "have.been.calledWithMatch",
      initialDate.startDate,
    );
    cy.findByLabelText("End date")
      .click()
      .clear()
      .type(initialDateValue.endDate);
    cy.realPress("Tab");
    cy.findByLabelText("End date").should("have.value", "formatted date");
    cy.get("@formatSpy").should(
      "have.been.calledWithMatch",
      initialDate.endDate,
    );
  });

  it("SHOULD support locale/timezone", () => {
    cy.mount(
      <Range
        defaultDate={{
          startDate: new CalendarDate(2030, 8, 1),
          endDate: new CalendarDate(2030, 12, 1),
        }}
        locale={"es-ES"}
        timeZone={"America/New_York"}
      />,
    );
    cy.findByLabelText("Start date").should("have.value", "01 ago 2030");
    cy.findByLabelText("End date").should("have.value", "01 dic 2030");
  });

  describe("uncontrolled component", () => {
    it("SHOULD update when changed with a valid date", () => {
      const {
        startInputChangeSpy,
        endInputChangeSpy,
        dateChangeSpy,
        dateValueChangeSpy,
      } = setupSpies();

      cy.mount(
        <Range
          defaultValue={initialDateValue}
          startInputProps={{ onChange: startInputChangeSpy }}
          endInputProps={{ onChange: endInputChangeSpy }}
          onDateValueChange={dateValueChangeSpy}
          onDateChange={dateChangeSpy}
        />,
      );
      cy.findByLabelText("Start date")
        .click()
        .clear()
        .type(updatedDateValue.startDate);
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        {
          startDate: updatedDateValue.startDate,
          endDate: initialDateValue.endDate,
        },
        false,
      );
      cy.get("@dateChangeSpy").should("not.have.been.called");
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        {
          startDate: updatedFormattedDateValue.startDate,
          endDate: initialDateValue.endDate,
        },
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match({ type: "blur" }),
        { startDate: updatedDate.startDate, endDate: initialDate.endDate },
      );
      cy.findByLabelText("Start date").should(
        "have.value",
        updatedFormattedDateValue.startDate,
      );
      cy.findByLabelText("End date").should(
        "have.value",
        initialDateValue.endDate,
      );

      cy.findByLabelText("End date")
        .click()
        .clear()
        .type(updatedDateValue.endDate);
      cy.get("@endInputChangeSpy").should("have.been.calledWithMatch", {
        target: { value: updatedDateValue.endDate },
      });
      cy.get("@dateChangeSpy").should("have.been.calledOnce");
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        {
          startDate: updatedFormattedDateValue.startDate,
          endDate: updatedFormattedDateValue.endDate,
        },
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match({ type: "blur" }),
        updatedDate,
      );
      cy.findByLabelText("Start date").should(
        "have.value",
        updatedFormattedDateValue.startDate,
      );
      cy.findByLabelText("End date").should(
        "have.value",
        updatedFormattedDateValue.endDate,
      );
    });
  });

  describe("controlled component", () => {
    it("SHOULD update when changed with a valid date", () => {
      const {
        startInputChangeSpy,
        endInputChangeSpy,
        dateChangeSpy,
        dateValueChangeSpy,
      } = setupSpies();

      function ControlledDateInput() {
        const [date, setDate] = useState<DateRangeSelection | null>(
          initialDate,
        );

        const onDateChange = (
          event: SyntheticEvent,
          newDate: DateRangeSelection | null,
        ) => {
          event.persist();
          setDate(newDate);
          dateChangeSpy(event, newDate);
        };

        return (
          <Range
            date={date}
            startInputProps={{ onChange: startInputChangeSpy }}
            endInputProps={{ onChange: endInputChangeSpy }}
            onDateValueChange={dateValueChangeSpy}
            onDateChange={onDateChange}
          />
        );
      }

      cy.mount(<ControlledDateInput />);
      cy.findByLabelText("Start date")
        .click()
        .clear()
        .type(updatedDateValue.startDate);
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        {
          startDate: updatedDateValue.startDate,
          endDate: initialDateValue.endDate,
        },
        false,
      );
      cy.get("@dateChangeSpy").should("not.have.been.called");
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        {
          startDate: updatedFormattedDateValue.startDate,
          endDate: initialDateValue.endDate,
        },
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match({ type: "blur" }),
        { startDate: updatedDate.startDate, endDate: initialDate.endDate },
      );

      cy.findByLabelText("Start date").should(
        "have.value",
        updatedFormattedDateValue.startDate,
      );
      cy.findByLabelText("End date").should(
        "have.value",
        initialDateValue.endDate,
      );
      cy.findByLabelText("End date")
        .click()
        .clear()
        .type(updatedDateValue.endDate);
      cy.get("@endInputChangeSpy").should("have.been.calledWithMatch", {
        target: { value: updatedDateValue.endDate },
      });
      cy.get("@dateChangeSpy").should("have.been.calledOnce");
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        {
          startDate: updatedFormattedDateValue.startDate,
          endDate: updatedFormattedDateValue.endDate,
        },
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match({ type: "blur" }),
        updatedDate,
      );
      cy.findByLabelText("Start date").should(
        "have.value",
        updatedFormattedDateValue.startDate,
      );
      cy.findByLabelText("End date").should(
        "have.value",
        updatedFormattedDateValue.endDate,
      );
    });
  });
});
