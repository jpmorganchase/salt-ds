import { AdapterDateFns } from "@salt-ds/date-adapters";
import { AdapterDayjs } from "@salt-ds/date-adapters";
import { AdapterLuxon } from "@salt-ds/date-adapters";
import { AdapterMoment } from "@salt-ds/date-adapters";
import {
  DateDetailErrorEnum,
  type DateFrameworkType,
  type ParserResult,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  DateInputRange,
  type DateParserField,
  type DateRangeSelection,
} from "@salt-ds/lab";
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
 * @param expectedDate expected date range, undefined="", null=invalid date or expected date
 * @param adapter
 */
function assertDateChange(
  spy: any,
  expectedValue: { startDate?: string; endDate?: string },
  expectedDate: {
    startDate: DateFrameworkType | null | undefined;
    endDate: DateFrameworkType | null | undefined;
  },
  adapter: SaltDateAdapter<DateFrameworkType>,
) {
  const lastCallArgs = spy.args[spy.callCount - 1];
  const date = lastCallArgs[1];
  const details = lastCallArgs[2];
  const expectedValidStartDate = adapter.isValid(expectedDate.startDate);
  const expectedValidEndDate = adapter.isValid(expectedDate.endDate);

  if (expectedValidStartDate) {
    // assert valid start date
    expect(date.startDate).not.to.be.undefined;
    expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
      adapter.format(expectedDate.startDate, "DD MMM YYYY"),
    );
  } else if (expectedDate?.startDate === undefined) {
    // assert empty start date
    expect(adapter.isValid(date.startDate)).to.equal(false);
    expect(details.startDate.errors).to.deep.equal([
      { type: DateDetailErrorEnum.UNSET, message: "no date defined" },
    ]);
    expect(details.startDate).to.have.property(
      "value",
      expectedValue.startDate,
    );
  } else if (expectedDate?.startDate === null) {
    // assert invalid start date
    expect(adapter.isValid(date.startDate)).to.equal(false);
    expect(details.startDate.errors).to.deep.equal([
      { type: DateDetailErrorEnum.INVALID_DATE, message: "not a valid date" },
    ]);
    expect(details.startDate).to.have.property(
      "value",
      expectedValue.startDate,
    );
  }

  if (expectedValidEndDate) {
    // assert valid end date
    expect(date.endDate).not.to.be.undefined;
    expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
      adapter.format(expectedDate.endDate, "DD MMM YYYY"),
    );
  } else if (expectedDate?.endDate === undefined) {
    // assert empty end date
    expect(adapter.isValid(date.endDate)).to.equal(false);
    expect(details.endDate.errors).to.deep.equal([
      { type: DateDetailErrorEnum.UNSET, message: "no date defined" },
    ]);
    expect(details.endDate).to.have.property("value", expectedValue.endDate);
  } else if (expectedDate?.endDate === null) {
    // assert invalid end date
    expect(adapter.isValid(date.endDate)).to.equal(false);
    expect(details.endDate.errors).to.deep.equal([
      { type: DateDetailErrorEnum.INVALID_DATE, message: "not a valid date" },
    ]);
    expect(details.endDate).to.have.property("value", expectedValue.endDate);
  }
}

describe("GIVEN a DateInputRange", () => {
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

      const initialDate = {
        startDate: adapter.parse("05 Jan 2025", "DD MMM YYYY").date,
        endDate: adapter.parse("06 Feb 2026", "DD MMM YYYY").date,
      };
      const initialDateValue = {
        startDate: "05 Jan 2025",
        endDate: "06 Feb 2026",
      };

      // dayjs expects lowercase months - capitilisation of months is a consumer concern
      const updatedDateValue = {
        startDate: "01 Nov 2027",
        endDate: "02 Dec 2028",
      };
      const updatedFormattedDateValue = {
        startDate: "01 Nov 2027",
        endDate: "02 Dec 2028",
      };
      const updatedDate = {
        startDate: adapter.parse(
          updatedFormattedDateValue.startDate,
          "DD MMM YYYY",
        ).date,
        endDate: adapter.parse(updatedFormattedDateValue.endDate, "DD MMM YYYY")
          .date,
      };

      it("SHOULD render value, even when not a valid date", () => {
        cy.mount(
          <DateInputRange
            defaultValue={{
              startDate: "start date value",
              endDate: "end date value",
            }}
          />,
        );
        cy.findByLabelText("Start date").should(
          "have.value",
          "start date value",
        );
        cy.findByLabelText("End date").should("have.value", "end date value");
      });

      it("SHOULD call onDateChange only if value changes", () => {
        const onDateChangeSpy = cy.stub().as("dateChangeSpy");
        cy.mount(<DateInputRange onDateChange={onDateChangeSpy} />);

        // Test invalid start date
        cy.findByLabelText("Start date").click().clear().type("bad start date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 1);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: "bad start date", endDate: "" },
            {
              startDate: null,
              endDate: undefined,
            },
            adapter,
          ),
        );

        // Test updating invalid start date
        cy.findByLabelText("Start date")
          .click()
          .clear()
          .type("another bad start date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 2);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: "another bad start date", endDate: "" },
            {
              startDate: null,
              endDate: undefined,
            },
            adapter,
          ),
        );

        // Test invalid end date
        cy.findByLabelText("End date")
          .click()
          .clear()
          .type("another bad end date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 3);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            {
              startDate: "another bad start date",
              endDate: "another bad end date",
            },
            {
              startDate: null,
              endDate: null,
            },
            adapter,
          ),
        );
        // Test clearing start date
        cy.findByLabelText("Start date").click().clear();
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 4);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: "", endDate: "another bad end date" },
            {
              startDate: undefined,
              endDate: null,
            },
            adapter,
          ),
        );

        // Test clearing end date
        cy.findByLabelText("End date").click().clear();
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 5);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: "", endDate: "" },
            { startDate: undefined, endDate: undefined },
            adapter,
          ),
        );

        // Test valid start date
        cy.findByLabelText("Start date")
          .click()
          .clear()
          .type(initialDateValue.startDate);
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 6);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: initialDateValue.startDate, endDate: "" },
            {
              startDate: initialDate.startDate,
              endDate: undefined,
            },
            adapter,
          ),
        );

        // Test valid end date
        cy.findByLabelText("End date")
          .click()
          .clear()
          .type(initialDateValue.endDate);
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").should("have.callCount", 7);
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            {
              startDate: initialDateValue.startDate,
              endDate: initialDateValue.endDate,
            },
            {
              startDate: initialDate.startDate,
              endDate: initialDate.endDate,
            },
            adapter,
          ),
        );
      });

      it("SHOULD support custom formatter", () => {
        const onDateChangeSpy = cy.stub().as("dateChangeSpy");
        cy.mount(
          <DateInputRange format="DD/MM/YYYY" onDateChange={onDateChangeSpy} />,
        );
        cy.findByLabelText("Start date").click().clear().type("31/01/2024");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: "31/01/2024", endDate: "" },
            {
              startDate: adapter.parse("31/01/2024", "DD/MM/YYYY").date,
              endDate: undefined,
            },
            adapter,
          ),
        );
        cy.findByLabelText("End date").click().clear().type("31/12/2024");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            { startDate: "31/01/2024", endDate: "31/12/2024" },
            {
              startDate: adapter.parse("31/01/2024", "DD/MM/YYYY").date,
              endDate: adapter.parse("31/12/2024", "DD/MM/YYYY").date,
            },
            adapter,
          ),
        );
      });

      it("SHOULD support custom parser", () => {
        const onDateChangeSpy = cy.stub().as("dateChangeSpy");

        const customParserSpy = cy
          .stub()
          .as("customParserSpy")
          .callsFake(
            (
              inputDate: string,
              field: DateParserField,
            ): ParserResult<DateFrameworkType> => {
              if (inputDate === "custom start date") {
                return {
                  date: initialDate.startDate,
                  value: inputDate,
                };
              }
              if (inputDate === "custom end date") {
                return {
                  date: initialDate.endDate,
                  value: inputDate,
                };
              }
              if (inputDate === "") {
                return {
                  date: adapter.parse("invalid date", "DD MMM YYYY").date,
                  value: "",
                  errors: [
                    {
                      type: DateDetailErrorEnum.UNSET,
                      message: "no date defined",
                    },
                  ],
                };
              }
              return {
                date: adapter.parse(inputDate, "DD MMM YYYY").date,
                value: inputDate,
              };
            },
          );

        cy.mount(
          <DateInputRange
            format="DD MMM YYYY"
            onDateChange={onDateChangeSpy}
            parse={customParserSpy}
          />,
        );

        // Test update start date with custom value
        cy.findByLabelText("Start date")
          .click()
          .clear()
          .type("custom start date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            {
              startDate: "custom start date",
              endDate: "",
            },
            {
              startDate: initialDate.startDate,
              endDate: undefined,
            },
            adapter,
          ),
        );

        // Test update end date with custom value
        cy.findByLabelText("End date").click().clear().type("custom end date");
        cy.realPress("Tab");
        cy.get("@dateChangeSpy").then((spy) =>
          assertDateChange(
            spy,
            {
              startDate: "custom start date",
              endDate: "custom end date",
            },
            {
              startDate: initialDate.startDate,
              endDate: initialDate.endDate,
            },
            adapter,
          ),
        );

        cy.findByLabelText("Start date").should(
          "have.value",
          initialDateValue.startDate,
        );
        cy.findByLabelText("End date").should(
          "have.value",
          initialDateValue.endDate,
        );
      });

      describe("locale", () => {
        before(() => {
          cy.setDateLocale(adapter.lib === "date-fns" ? dateFnsEs : "es-ES");
        });
        after(() => {
          cy.setDateLocale(undefined);
        });

        it("SHOULD render dates in the current locale", () => {
          cy.mount(
            <DateInputRange
              defaultDate={{
                startDate: adapter.parse("01 Aug 2030", "DD MMM YYYY").date,
                endDate: adapter.parse("01 Dec 2030", "DD MMM YYYY").date,
              }}
            />,
          );
          cy.findByLabelText("Start date").should("have.value", "01 ago 2030");
          cy.findByLabelText("End date").should("have.value", "01 dic 2030");
        });
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
          const handleStartInputChange = (
            event: ChangeEvent<HTMLInputElement>,
          ) => {
            // React 16 backwards compatibility
            event.persist();
            startInputChangeSpy(event);
          };
          const handleEndInputChange = (
            event: ChangeEvent<HTMLInputElement>,
          ) => {
            // React 16 backwards compatibility
            event.persist();
            endInputChangeSpy(event);
          };
          cy.mount(
            <DateInputRange
              defaultDate={initialDate}
              startInputProps={{ onChange: handleStartInputChange }}
              endInputProps={{ onChange: handleEndInputChange }}
              onDateValueChange={dateValueChangeSpy}
              onDateChange={dateChangeSpy}
            />,
          );

          // Test update start date
          cy.findByLabelText("Start date")
            .click()
            .clear()
            .type(updatedDateValue.startDate);
          cy.get("@startInputChangeSpy").should("have.been.calledWithMatch", {
            target: { value: updatedDateValue.startDate },
          });
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            {
              startDate: updatedDateValue.startDate,
              endDate: initialDateValue.endDate,
            },
          );
          cy.get("@dateChangeSpy").should("not.have.been.called");
          cy.realPress("Tab");
          cy.get("@dateChangeSpy").then((spy) =>
            assertDateChange(
              spy,
              {
                startDate: updatedFormattedDateValue.startDate,
                endDate: initialDateValue.endDate,
              },
              {
                startDate: updatedDate.startDate,
                endDate: initialDate.endDate,
              },
              adapter,
            ),
          );
          cy.findByLabelText("Start date").should(
            "have.value",
            updatedFormattedDateValue.startDate,
          );
          cy.findByLabelText("End date").should(
            "have.value",
            initialDateValue.endDate,
          );

          // Test update end date
          cy.findByLabelText("End date")
            .click()
            .clear()
            .type(updatedDateValue.endDate);
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            {
              startDate: updatedFormattedDateValue.startDate,
              endDate: updatedDateValue.endDate,
            },
          );
          cy.get("@endInputChangeSpy").should("have.been.calledWithMatch", {
            target: { value: updatedDateValue.endDate },
          });
          cy.get("@dateChangeSpy").should("have.been.calledOnce");
          cy.realPress("Tab");
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            {
              startDate: updatedFormattedDateValue.startDate,
              endDate: updatedFormattedDateValue.endDate,
            },
          );
          cy.get("@dateChangeSpy").then((spy) =>
            assertDateChange(
              spy,
              {
                startDate: updatedFormattedDateValue.startDate,
                endDate: updatedDateValue.endDate,
              },
              {
                startDate: updatedDate.startDate,
                endDate: updatedDate.endDate,
              },
              adapter,
            ),
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
            const [date, setDate] = useState<
              DateRangeSelection<DateFrameworkType> | null | undefined
            >(initialDate);

            const handleDateChange = (
              event: SyntheticEvent,
              newDate: DateRangeSelection<DateFrameworkType> | null | undefined,
            ) => {
              // React 16 backwards compatibility
              event.persist();
              setDate(newDate);
              dateChangeSpy(event, newDate);
            };
            const handleStartInputChange = (
              event: ChangeEvent<HTMLInputElement>,
            ) => {
              // React 16 backwards compatibility
              event.persist();
              startInputChangeSpy(event);
            };
            const handleEndInputChange = (
              event: ChangeEvent<HTMLInputElement>,
            ) => {
              // React 16 backwards compatibility
              event.persist();
              endInputChangeSpy(event);
            };

            return (
              <DateInputRange
                date={date}
                startInputProps={{ onChange: handleStartInputChange }}
                endInputProps={{ onChange: handleEndInputChange }}
                onDateValueChange={dateValueChangeSpy}
                onDateChange={handleDateChange}
              />
            );
          }

          cy.mount(<ControlledDateInput />);

          // Test update start date
          cy.findByLabelText("Start date")
            .click()
            .clear()
            .type(updatedDateValue.startDate);
          cy.get("@startInputChangeSpy").should("have.been.calledWithMatch", {
            target: { value: updatedDateValue.startDate },
          });
          cy.realPress("Tab");
          cy.get("@dateValueChangeSpy").should(
            "have.been.calledWithMatch",
            Cypress.sinon.match.any,
            {
              startDate: updatedFormattedDateValue.startDate,
              endDate: initialDateValue.endDate,
            },
          );
          cy.get("@dateChangeSpy").then((spy) =>
            assertDateChange(
              spy,
              {
                startDate: updatedDateValue.startDate,
                endDate: initialDateValue.endDate,
              },
              {
                startDate: updatedDate.startDate,
                endDate: initialDate.endDate,
              },
              adapter,
            ),
          );

          // Test update end date
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
            Cypress.sinon.match.any,
            {
              startDate: updatedFormattedDateValue.startDate,
              endDate: updatedFormattedDateValue.endDate,
            },
          );
          cy.get("@dateChangeSpy").then((spy) =>
            assertDateChange(
              spy,
              {
                startDate: updatedDateValue.startDate,
                endDate: updatedDateValue.endDate,
              },
              {
                startDate: updatedDate.startDate,
                endDate: updatedDate.endDate,
              },
              adapter,
            ),
          );
        });
      });
    });
  });
});
