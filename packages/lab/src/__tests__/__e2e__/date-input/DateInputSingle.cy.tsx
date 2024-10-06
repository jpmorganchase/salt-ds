import { CalendarDate, type DateValue } from "@internationalized/date";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { composeStories } from "@storybook/react";
import { type ChangeEvent, type SyntheticEvent, useState } from "react";
import type { DateInputSingleParserResult } from "../../../date-input";

const composedStories = composeStories(dateInputStories);
const { Single } = composedStories;

describe("GIVEN a DateInputSingle", () => {
  const testLocale = "en-GB";
  const testTimeZone = "Europe/London";

  const initialDateValue = "05 Jan 2025";
  const initialDate = new CalendarDate(2025, 1, 5);

  const updatedDateValue = "1 Nov 2027";
  const updatedFormattedDateValue = "01 Nov 2027";
  const updatedDate = new CalendarDate(2027, 11, 1);

  it("SHOULD render value, even when not a valid date", () => {
    cy.mount(<Single value={"date value"} locale={testLocale} />);
    cy.findByRole("textbox").should("have.value", "date value");
  });

  it("SHOULD call onDateChange on consecutive invalid dates", () => {
    const onDateChangeSpy = cy.stub().as("dateChangeSpy");
    cy.mount(<Single locale={testLocale} onDateChange={onDateChangeSpy} />);
    cy.findByRole("textbox").click().clear().type("bad date");
    cy.realPress("Tab");
    cy.get("@dateChangeSpy").should("have.been.calledOnce");
    cy.get("@dateChangeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      null,
      "not a valid date format",
    );
    cy.findByRole("textbox").click().clear().type("another bad date 2");
    cy.realPress("Tab");
    cy.get("@dateChangeSpy").should("have.been.calledTwice");
    cy.get("@dateChangeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      null,
      "not a valid date format",
    );
  });

  it("SHOULD support custom parser", () => {
    const parseSpy = cy.stub().as("parseSpy");
    const customParser = (
      inputDate: string,
      locale: string,
    ): DateInputSingleParserResult => {
      const parsedAsDate = updatedDate;
      parseSpy(inputDate, locale);
      return { date: parsedAsDate, error: false };
    };
    cy.mount(
      <Single
        defaultValue={"text value"}
        parse={customParser}
        locale={testLocale}
      />,
    );
    // Simulate user entering "new value" into the input
    cy.findByRole("textbox").click().clear().type("new value");
    // Simulate pressing the Tab key to trigger blur event
    cy.realPress("Tab");
    // Verify that the input is updated with the parsed value
    cy.findByRole("textbox").should("have.value", updatedFormattedDateValue);
    cy.get("@parseSpy").should("have.been.calledWithMatch", "new value");
  });

  it("SHOULD support custom formatter", () => {
    const formatSpy = cy.stub().as("formatSpy");
    const customFormatter = (dateToFormat: DateValue | null): string => {
      formatSpy(dateToFormat);
      return dateToFormat ? "formatted date" : "";
    };
    cy.mount(
      <Single
        defaultValue={"text value"}
        format={customFormatter}
        locale={testLocale}
      />,
    );
    // Simulate user entering updated date value into the input
    cy.findByRole("textbox").click().clear().type(updatedDateValue);
    // Simulate pressing the Tab key to trigger blur event
    cy.realPress("Tab");
    // Verify that the input box is updated with the formatted value
    cy.findByRole("textbox").should("have.value", "formatted date");
    cy.get("@formatSpy").should("have.been.calledWithMatch", updatedDate);
  });

  it("SHOULD support local/timezone", () => {
    cy.mount(
      <Single
        defaultDate={new CalendarDate(2030, 8, 1)}
        locale={"es-ES"}
        timeZone={testTimeZone}
      />,
    );
    // Verify that the input is updated with the date value in the specified locale
    cy.findByRole("textbox").should("have.value", "01 ago 2030");
  });

  describe("uncontrolled component", () => {
    let inputChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateValueChangeSpy: Cypress.Agent<sinon.SinonStub>;
    before(() => {
      inputChangeSpy = cy.stub().as("inputChangeSpy");
      dateChangeSpy = cy.stub().as("dateChangeSpy");
      dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
    });

    it("SHOULD update when changed with a valid date", () => {
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
        inputChangeSpy(event);
      };

      cy.mount(
        <Single
          defaultDate={initialDate}
          onChange={handleChange}
          onDateValueChange={dateValueChangeSpy}
          onDateChange={dateChangeSpy}
          locale={testLocale}
          timeZone={testTimeZone}
        />,
      );
      // Simulate user entering updated date value into the input
      cy.findByRole("textbox").click().clear().type(updatedDateValue);
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        updatedDateValue,
        false,
      );
      cy.get("@dateChangeSpy").should("not.have.been.called");
      cy.get("@inputChangeSpy").should("have.been.calledWithMatch", {
        target: { value: updatedDateValue },
      });
      // Simulate pressing the Tab key to trigger blur event
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        updatedDateValue,
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match.any,
        updatedDate,
      );
    });
  });

  describe("controlled component", () => {
    let inputChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateChangeSpy: Cypress.Agent<sinon.SinonStub>;
    let dateValueChangeSpy: Cypress.Agent<sinon.SinonStub>;
    before(() => {
      inputChangeSpy = cy.stub().as("inputChangeSpy");
      dateChangeSpy = cy.stub().as("dateChangeSpy");
      dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
    });

    it("SHOULD update when changed with a valid date", () => {
      function ControlledDateInput() {
        const [date, setDate] = useState<DateValue | null>(initialDate);

        const onChange = (event: SyntheticEvent) => {
          // React 16 backwards compatibility
          event.persist();
          inputChangeSpy(event);
        };
        const onDateChange = (
          event: SyntheticEvent,
          newDate: DateValue | null,
        ) => {
          // React 16 backwards compatibility
          event.persist();
          setDate(newDate);
          dateChangeSpy(event, newDate);
        };

        return (
          <Single
            date={date}
            onChange={onChange}
            onDateValueChange={dateValueChangeSpy}
            onDateChange={onDateChange}
            locale={testLocale}
            timeZone={testTimeZone}
          />
        );
      }

      cy.mount(<ControlledDateInput />);
      // Simulate user entering updated date value into the input
      cy.findByRole("textbox").click().clear().type(updatedDateValue);
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        updatedDateValue,
        false,
      );
      cy.get("@dateChangeSpy").should("not.have.been.called");
      cy.get("@inputChangeSpy").should("have.been.calledWithMatch", {
        target: { value: updatedDateValue },
      });
      // Simulate pressing the Tab key to trigger blur event
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        updatedDateValue,
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match.any,
        updatedDate,
      );
    });
  });
});
