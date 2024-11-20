import { type SyntheticEvent, useState } from "react";
import {
  AdapterDateFns,
  AdapterDayjs,
  AdapterLuxon,
  AdapterMoment,
  DateDetailErrorEnum,
  DateFrameworkType,
  DateInputSingle,
  SaltDateAdapter,
} from "@salt-ds/lab";
import { es as dateFnsEs } from "date-fns/locale";
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

function assertDateChange(
  spy: any,
  expectedValue: string,
  expectedDate: DateFrameworkType | undefined,
  adapter: SaltDateAdapter<DateFrameworkType>,
) {
  const lastCallArgs = spy.args[spy.callCount - 1];
  const date = lastCallArgs[1];
  const details = lastCallArgs[2];
  const expectedValidDate = adapter.isValid(expectedDate);

  // assert undefined when expecting no date is defined
  if (expectedDate === undefined) {
    expect(date).to.be.undefined;
  } else if (expectedValidDate) {
    // assert valid date matches expected date
    expect(adapter.format(date, "DD MMM YYYY")).to.equal(
      adapter.format(expectedDate, "DD MMM YYYY"),
    );
  }
  if (date && !expectedValidDate) {
    // assert error details when expecting an invalid date
    expect(details).to.deep.equal({
      errors: [
        { type: DateDetailErrorEnum.INVALID_DATE, message: "not a valid date" },
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
      const updatedDate = adapter.parse(updatedFormattedDateValue, "DD MMM YYYY").date;

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
          assertDateChange(
            spy,
            "bad date",
            adapter.parse("bad date", "DD MMM YYYY").date,
            adapter,
          ),
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
          assertDateChange(
            spy,
            "another bad date",
            adapter.parse("another bad date", "DD MMM YYYY").date,
            adapter,
          ),
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
          cy.mount(
            <DateInputSingle
              defaultDate={initialDate}
              onChange={inputChangeSpy}
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
          cy.findByRole("textbox").should("have.value", updatedFormattedDateValue);
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

            const onDateChange = (
              event: SyntheticEvent,
              newDate: DateFrameworkType | null,
            ) => {
              setDate(newDate);
              dateChangeSpy(event, newDate);
            };

            return (
              <DateInputSingle
                date={date}
                onChange={inputChangeSpy}
                onDateValueChange={dateValueChangeSpy}
                onDateChange={onDateChange}
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
          cy.findByRole("textbox").should("have.value", updatedFormattedDateValue);
        });
      });
    });
  });
});
