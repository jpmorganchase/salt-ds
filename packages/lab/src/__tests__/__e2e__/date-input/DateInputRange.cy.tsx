import { CalendarDate, type DateValue } from "@internationalized/date";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { composeStories } from "@storybook/react";
import { type ChangeEvent, type SyntheticEvent, useState } from "react";
import type { DateRangeSelection } from "../../../calendar";
import type {
  DateInputRangeParserError,
  DateInputRangeParserResult,
} from "../../../date-input";

const composedStories = composeStories(dateInputStories);
const { Range } = composedStories;

describe("GIVEN a DateInputRange", () => {
  const testLocale = "en-GB";
  const testTimeZone = "Europe/London";

  const initialDate = {
    startDate: new CalendarDate(2025, 1, 5),
    endDate: new CalendarDate(2026, 2, 6),
  };
  const initialDateValue = { startDate: "05 Jan 2025", endDate: "06 Feb 2026" };

  const updatedDateValue = { startDate: "1 Nov 2027", endDate: "2 Dec 2028" };
  const updatedFormattedDateValue = {
    startDate: "01 Nov 2027",
    endDate: "02 Dec 2028",
  };
  const updatedDate = {
    startDate: new CalendarDate(2027, 11, 1),
    endDate: new CalendarDate(2028, 12, 2),
  };

  it("SHOULD render value, even when not a valid date", () => {
    cy.mount(
      <Range
        defaultDate={undefined}
        defaultValue={{
          startDate: "start date value",
          endDate: "end date value",
        }}
        locale={testLocale}
        timeZone={testTimeZone}
      />,
    );
    // Verify that the start and end date inputs have the specified values
    cy.findByLabelText("Start date").should("have.value", "start date value");
    cy.findByLabelText("End date").should("have.value", "end date value");
  });

  it("SHOULD support custom parser", () => {
    const parseSpy = cy.stub().as("parseSpy");
    const customParser = (inputDate: string): DateInputRangeParserResult => {
      const parsedAsDate = updatedDate.startDate;
      parseSpy(inputDate);
      return { date: parsedAsDate, error: false };
    };

    cy.mount(
      <Range
        defaultValue={{ startDate: "text value" }}
        parse={customParser}
        locale={testLocale}
        timeZone={testTimeZone}
      />,
    );
    // Simulate user entering "new start date value" into the start date input
    cy.findByLabelText("Start date")
      .click()
      .clear()
      .type("new start date value");
    // Simulate pressing the Tab key to trigger blur event
    cy.realPress("Tab");
    // Verify that the start date input is updated with the parsed value
    cy.findByLabelText("Start date").should(
      "have.value",
      updatedFormattedDateValue.startDate,
    );
    cy.get("@parseSpy").should(
      "have.been.calledWithMatch",
      "new start date value",
    );
    // Simulate user entering "new end date value" into the end date input
    cy.findByLabelText("End date").click().clear().type("new end date value");
    // Simulate pressing the Tab key to trigger blur event
    cy.realPress("Tab");
    // Verify that the end date input is updated with the parsed value
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
    const customFormatter = (dateToFormat: DateValue | null): string => {
      formatSpy(dateToFormat);
      return dateToFormat ? "formatted date" : "";
    };

    cy.mount(
      <Range
        defaultValue={{ startDate: "text value" }}
        format={customFormatter}
        locale={testLocale}
      />,
    );
    // Simulate user entering initial start date value into the start date input
    cy.findByLabelText("Start date")
      .click()
      .clear()
      .type(initialDateValue.startDate);
    // Simulate pressing the Tab key to trigger blur event
    cy.realPress("Tab");
    // Verify that the start date input is updated with the formatted value
    cy.findByLabelText("Start date").should("have.value", "formatted date");
    cy.get("@formatSpy").should(
      "have.been.calledWithMatch",
      initialDate.startDate,
    );
    // Simulate user entering initial end date value into the end date input
    cy.findByLabelText("End date")
      .click()
      .clear()
      .type(initialDateValue.endDate);
    // Simulate pressing the Tab key to trigger blur event
    cy.realPress("Tab");
    // Verify that the end date input is updated with the formatted value
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
        timeZone={testTimeZone}
      />,
    );
    // Verify that the start and end date inputs are updated with the date values in the specified locale
    cy.findByLabelText("Start date").should("have.value", "01 ago 2030");
    cy.findByLabelText("End date").should("have.value", "01 dic 2030");
  });

  describe("uncontrolled component", () => {
    let startInputChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let endInputChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateValueChangeSpy: Cypress.Agent<sinon.SinonStub>;
    beforeEach(() => {
      startInputChangeSpy = cy.stub().as("startInputChangeSpy");
      endInputChangeSpy = cy.stub().as("endInputChangeSpy");
      dateChangeSpy = cy.stub().as("dateChangeSpy");
      dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
    });

    it("SHOULD update when changed with a valid date", () => {
      const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
        startInputChangeSpy(event);
      };
      const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
        endInputChangeSpy(event);
      };

      cy.mount(
        <Range
          defaultDate={initialDate}
          startInputProps={{ onChange: handleStartDateChange }}
          endInputProps={{ onChange: handleEndDateChange }}
          onDateValueChange={dateValueChangeSpy}
          onDateChange={dateChangeSpy}
          locale={testLocale}
        />,
      );
      // Simulate user entering updated start date value into the start date input
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
      // Simulate pressing the Tab key to trigger blur event
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
        Cypress.sinon.match.any,
        { startDate: updatedDate.startDate, endDate: initialDate.endDate },
        { startDate: false, endDate: false },
      );
      // Verify that the start date input is updated with the formatted value
      cy.findByLabelText("Start date").should(
        "have.value",
        updatedFormattedDateValue.startDate,
      );
      // Verify that the end date input retains its initial value
      cy.findByLabelText("End date").should(
        "have.value",
        initialDateValue.endDate,
      );

      // Simulate user entering updated end date value into the end date input
      cy.findByLabelText("End date")
        .click()
        .clear()
        .type(updatedDateValue.endDate);
      cy.get("@endInputChangeSpy").should("have.been.calledWithMatch", {
        target: { value: updatedDateValue.endDate },
      });
      cy.get("@dateChangeSpy").should("have.been.calledOnce");
      // Simulate pressing the Tab key to trigger blur event
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
        Cypress.sinon.match.any,
        { startDate: updatedDate.startDate, endDate: updatedDate.endDate },
        { startDate: false, endDate: false },
      );
      // Verify that the start and end date inputs are updated with the formatted values
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
    let startInputChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let endInputChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateValueChangeSpy: Cypress.Agent<sinon.SinonStub>;
    beforeEach(() => {
      startInputChangeSpy = cy.stub().as("startInputChangeSpy");
      endInputChangeSpy = cy.stub().as("endInputChangeSpy");
      dateChangeSpy = cy.stub().as("dateChangeSpy");
      dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
    });

    it("SHOULD update when changed with a valid date", () => {
      function ControlledDateInput() {
        const [date, setDate] = useState<DateRangeSelection | null>(
          initialDate,
        );

        const handleStartDateChange = (
          event: ChangeEvent<HTMLInputElement>,
        ) => {
          // React 16 backwards compatibility
          event.persist();
          startInputChangeSpy(event);
        };
        const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          endInputChangeSpy(event);
        };
        const handleDateChange = (
          event: SyntheticEvent,
          newDate: DateRangeSelection | null,
          error: {
            startDate: DateInputRangeParserError;
            endDate: DateInputRangeParserError;
          },
        ) => {
          event.persist();
          setDate(newDate);
          dateChangeSpy(event, newDate, error);
        };

        return (
          <Range
            date={date}
            startInputProps={{ onChange: handleStartDateChange }}
            endInputProps={{ onChange: handleEndDateChange }}
            onDateValueChange={dateValueChangeSpy}
            onDateChange={handleDateChange}
            locale={testLocale}
          />
        );
      }

      cy.mount(<ControlledDateInput />);
      // Simulate user entering updated start date value into the start date input
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
      // Simulate pressing the Tab key to trigger blur event
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
        Cypress.sinon.match.any,
        { startDate: updatedDate.startDate, endDate: initialDate.endDate },
        { startDate: false, endDate: false },
      );

      // Verify that the start date input is updated with the formatted value
      cy.findByLabelText("Start date").should(
        "have.value",
        updatedFormattedDateValue.startDate,
      );
      // Verify that the end date input retains its initial value
      cy.findByLabelText("End date").should(
        "have.value",
        initialDateValue.endDate,
      );
      // Simulate user entering updated end date value into the end date input
      cy.findByLabelText("End date")
        .click()
        .clear()
        .type(updatedDateValue.endDate);
      cy.get("@endInputChangeSpy").should("have.been.calledWithMatch", {
        target: { value: updatedDateValue.endDate },
      });
      cy.get("@dateChangeSpy").should("have.been.calledOnce");
      // Simulate pressing the Tab key to trigger blur event
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
        Cypress.sinon.match.any,
        { startDate: updatedDate.startDate, endDate: updatedDate.endDate },
        { startDate: false, endDate: false },
      );
      // Verify that the start and end date inputs are updated with the formatted values
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
