import {
  DateDetailErrorEnum,
  type DateFrameworkType,
  type ParserResult,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters";
import { AdapterDayjs } from "@salt-ds/date-adapters";
import { AdapterLuxon } from "@salt-ds/date-adapters";
import { AdapterMoment } from "@salt-ds/date-adapters";
import { DateInputSingle } from "@salt-ds/lab";

import { es as dateFnsEs } from "date-fns/locale";
import { type ChangeEvent, type SyntheticEvent, useState } from "react";
import "moment/dist/locale/es";
import "dayjs/locale/es";

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

// Update locale for moment
adapterMoment.moment.updateLocale("es", {
  monthsShort: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
});

// Create an array of adapters
const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

/**
 * Validate change helper
 * @param spy
 * @param expectedValue expected value returned by change
 * @param expectedDate expected date, undefined="", null=invalid date or expected date
 * @param adapter
 */
function assertDateChange(
  spy: any,
  expectedValue: string,
  expectedDate: DateFrameworkType | null | undefined,
  adapter: SaltDateAdapter<DateFrameworkType>,
) {
  const lastCallArgs = spy.args[spy.callCount - 1];
  const date = lastCallArgs[1];
  const details = lastCallArgs[2];
  const expectedValidDate = adapter.isValid(expectedDate);

  // assert valida date
  if (expectedValidDate) {
    // assert valid date matches expected date
    expect(adapter.format(date, "DD MMM YYYY")).to.equal(
      adapter.format(expectedDate, "DD MMM YYYY"),
    );
  } else if (expectedValidDate === undefined) {
    // assert empty date
    expect(adapter.isValid(date)).to.equal(false);
    expect(details).to.deep.equal({
      errors: [{ type: DateDetailErrorEnum.UNSET, message: "no date defined" }],
      value: expectedValue,
    });
  } else if (expectedValidDate === null) {
    // assert invalid date
    expect(adapter.isValid(date)).to.equal(false);
    expect(details).to.deep.equal({
      errors: [
        { type: DateDetailErrorEnum.UNSET, message: "not a valid date" },
      ],
      value: expectedValue,
    });
  }
}

describe("GIVEN a DateInputSingle", () => {
  adapters.forEach((adapter) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      const initialDateValue = "05 Jan 2025";
      const initialDate = adapter.parse(initialDateValue, "DD MMM YYYY").date;

      // dayjs expects lowercase months - capitilisation of months is a consumer concern
      const updatedDateValue =
        adapter.lib !== "dayjs" ? "01 nov 2027" : "01 Nov 2027";
      const updatedFormattedDateValue = "01 Nov 2027";
      const updatedDate = adapter.parse(
        updatedFormattedDateValue,
        "DD MMM YYYY",
      ).date;

      it("SHOULD render value, even when not a valid date", () => {
        cy.mount(<DateInputSingle defaultValue={"date value"} />);
        cy.findByRole("textbox").should("have.value", "date value");
      });

      it("SHOULD call onDateChange only if value changes", () => {
        const onDateChangeSpy = cy.stub().as("dateChangeSpy");
        const onDateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
        cy.mount(
          <DateInputSingle
            onDateChange={onDateChangeSpy}
            onDateValueChange={onDateValueChangeSpy}
          />,
        );

        // Test invalid date entry
        cy.findByRole("textbox").click().clear().type("bad date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 1);
        cy.get("@dateValueChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          "bad date",
        );
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(spy, "bad date", null, adapter),
        );

        // Test re-entering the same invalid date
        cy.findByRole("textbox").click().clear().type("bad date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 1);

        // Test entering a different invalid date
        cy.findByRole("textbox").click().clear().type("another bad date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 2);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(spy, "another bad date", null, adapter),
        );
        cy.get("@dateValueChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          "another bad date",
        );

        // Test clearing the date
        cy.findByRole("textbox").click().clear();
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 3);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(spy, "", undefined, adapter),
        );
        cy.get("@dateValueChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          "",
        );

        // Test entering a valid date
        cy.findByRole("textbox").click().clear().type(initialDateValue);
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 4);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(spy, initialDateValue, initialDate, adapter),
        );

        // Test re-entering the same valid date
        cy.findByRole("textbox").click().clear().type(initialDateValue);
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 4);
      });

      it("SHOULD support custom formatter", () => {
        const onDateChangeSpy = cy.stub().as("dateChangeSpy");
        cy.mount(
          <DateInputSingle
            format="DD/MM/YYYY"
            onDateChange={onDateChangeSpy}
          />,
        );
        cy.findByRole("textbox").click().clear().type("01/02/2024");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            "01/02/2024",
            adapter.parse("01/02/2024", "DD/MM/YYYY").date,
            adapter,
          ),
        );
        cy.findByRole("textbox").should("have.value", "01/02/2024");
      });

      it("SHOULD support custom parser", () => {
        const onDateChangeSpy = cy.stub().as("dateChangeSpy");
        const customParserSpy = cy
          .stub()
          .as("customParserSpy")
          .callsFake((inputDate: string): ParserResult<DateFrameworkType> => {
            expect(inputDate).to.equal("custom value");
            return {
              date: initialDate,
              value: initialDateValue,
            };
          });
        cy.mount(
          <DateInputSingle
            format="DD MMM YYYY"
            onDateChange={onDateChangeSpy}
            parse={customParserSpy}
          />,
        );
        cy.findByRole("textbox").click().clear().type("custom value");
        cy.realPress("Tab");
        cy.get("@customParserSpy").should("have.been.calledOnce");
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(spy, initialDateValue, initialDate, adapter),
        );
        cy.findByRole("textbox").should("have.value", initialDateValue);
      });

      describe("locale", () => {
        before(() => {
          cy.setDateLocale(adapter.lib === "date-fns" ? dateFnsEs : "es-ES");
        });
        after(() => {
          cy.setDateLocale(undefined);
        });

        it("SHOULD render date in the current locale", () => {
          cy.mount(
            <DateInputSingle
              defaultDate={adapter.parse("01 Aug 2030", "DD MMM YYYY").date}
            />,
          );
          cy.findByRole("textbox").should("have.value", "01 ago 2030");
        });
      });

      describe("uncontrolled component", () => {
        let inputChangeSpy: Cypress.Agent<sinon.SinonStub>;
        let dateChangeSpy: Cypress.Agent<sinon.SinonStub>;
        let dateValueChangeSpy: Cypress.Agent<sinon.SinonStub>;

        beforeEach(() => {
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
            <DateInputSingle
              defaultDate={initialDate}
              onChange={handleChange}
              onDateValueChange={dateValueChangeSpy}
              onDateChange={dateChangeSpy}
            />,
          );
          cy.findByRole("textbox").click().clear().type(updatedDateValue);
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            updatedDateValue,
          );
          cy.get("@dateChangeSpy").should("not.have.been.called");
          cy.get("@inputChangeSpy").should("have.been.calledWithMatch", {
            target: { value: updatedDateValue },
          });
          cy.realPress("Tab");
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            updatedFormattedDateValue,
          );
          cy.get("@dateChangeSpy").then((spy) =>
            assertDateChange(spy, updatedDateValue, updatedDate, adapter),
          );
          cy.findByRole("textbox").should(
            "have.value",
            updatedFormattedDateValue,
          );
        });
      });

      describe("controlled component", () => {
        let inputChangeSpy: Cypress.Agent<sinon.SinonStub>;
        let dateChangeSpy: Cypress.Agent<sinon.SinonStub>;
        let dateValueChangeSpy: Cypress.Agent<sinon.SinonStub>;

        beforeEach(() => {
          inputChangeSpy = cy.stub().as("inputChangeSpy");
          dateChangeSpy = cy.stub().as("dateChangeSpy");
          dateValueChangeSpy = cy.stub().as("dateValueChangeSpy");
        });

        it("SHOULD update when changed with a valid date", () => {
          function ControlledDateInput() {
            const [date, setDate] = useState<DateFrameworkType | null>(
              initialDate,
            );

            const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
              // React 16 backwards compatibility
              event.persist();
              inputChangeSpy(event);
            };

            const handleDateChange = (
              event: SyntheticEvent,
              newDate: DateFrameworkType | null,
            ) => {
              // React 16 backwards compatibility
              event.persist();
              setDate(newDate);
              dateChangeSpy(event, newDate);
            };

            return (
              <DateInputSingle
                date={date}
                onChange={handleChange}
                onDateValueChange={dateValueChangeSpy}
                onDateChange={handleDateChange}
              />
            );
          }

          cy.mount(<ControlledDateInput />);
          cy.findByRole("textbox").click().clear().type(updatedDateValue);
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            updatedDateValue,
          );
          cy.get("@dateChangeSpy").should("not.have.been.called");
          cy.get("@inputChangeSpy").should("have.been.calledWithMatch", {
            target: { value: updatedDateValue },
          });
          cy.realPress("Tab");
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            updatedDateValue,
          );
          cy.get("@dateChangeSpy").then((spy) =>
            assertDateChange(spy, updatedDateValue, updatedDate, adapter),
          );
          cy.findByRole("textbox").should(
            "have.value",
            updatedFormattedDateValue,
          );
        });
      });
    });
  });
});
