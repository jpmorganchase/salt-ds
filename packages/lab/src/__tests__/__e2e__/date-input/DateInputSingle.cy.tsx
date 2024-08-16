import { SyntheticEvent, useState } from "react";
import { CalendarDate, DateValue } from "@internationalized/date";
import { composeStories } from "@storybook/react";
import * as dateInputStories from "@stories/date-input/date-input.stories";

const composedStories = composeStories(dateInputStories);
const { Single } = composedStories;

describe("GIVEN a DateInputSingle", () => {
  const initialDateValue = "05 Jan 2025";
  const initialDate = new CalendarDate(2025, 1, 5);

  const updatedDateValue = "1 Nov 2027";
  const updatedFormattedDateValue = "01 Nov 2027";
  const updatedDate = new CalendarDate(2027, 11, 1);

  const setupSpies = () => {
    const inputChangeSpy = cy.stub().as("inputChangeSpy");
    const dateChangeSpy = cy.stub().as("dateChangeSpy");
    const dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
    return {
      inputChangeSpy,
      dateChangeSpy,
      dateValueChangeSpy,
    };
  };

  it("SHOULD render value, even when not a valid date", () => {
    cy.mount(<Single value={"date value"} />);
    cy.findByRole("textbox").should("have.value", "date value");
  });

  it("SHOULD support custom parser", () => {
    const parseSpy = cy.stub().as("parseSpy");
    const customParser = (
      inputDate: string | undefined,
    ): DateValue | undefined => {
      const parsedAsDate = updatedDate;
      parseSpy(inputDate);
      return parsedAsDate;
    };
    cy.mount(<Single defaultValue={"text value"} parse={customParser} />);
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
    const customFormatter = (
      dateToFormat: DateValue | null | undefined,
    ): string => {
      formatSpy(dateToFormat);
      return "formatted date";
    };
    cy.mount(
      <Single defaultValue={"text value"} formatDate={customFormatter} />,
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
        timeZone={"America/New_York"}
      />,
    );
    // Verify that the input is updated with the date value in the specified locale
    cy.findByRole("textbox").should("have.value", "01 ago 2030");
  });

  describe("uncontrolled component", () => {
    it("SHOULD update when changed with a valid date", () => {
      const { inputChangeSpy, dateChangeSpy, dateValueChangeSpy } =
        setupSpies();

      cy.mount(
        <Single
          defaultValue={initialDateValue}
          onChange={inputChangeSpy}
          onDateValueChange={dateValueChangeSpy}
          onDateChange={dateChangeSpy}
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
      // Simulate pressing the Tab key to trigger blur event
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        updatedDateValue,
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match({ type: "blur" }),
        updatedDate,
      );
    });
  });

  describe("controlled component", () => {
    it("SHOULD update when changed with a valid date", () => {
      const changeSpy = cy.stub().as("changeSpy");
      const dateChangeSpy = cy.stub().as("dateChangeSpy");
      const dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");

      function ControlledDateInput() {
        const [date, setDate] = useState<DateValue | null>(initialDate);

        const onChange = (event: SyntheticEvent) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
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
      // Simulate pressing the Tab key to trigger blur event
      cy.realPress("Tab");
      cy.get("@dateValueChangeSpy").should(
        "have.been.calledWithMatch",
        updatedDateValue,
        true,
      );
      cy.get("@dateChangeSpy").should(
        "have.been.calledWithMatch",
        Cypress.sinon.match({ type: "blur" }),
        updatedDate,
      );
    });
  });
});
