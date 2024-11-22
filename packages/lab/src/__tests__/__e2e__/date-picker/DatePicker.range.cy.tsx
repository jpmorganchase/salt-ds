import {
  DateDetailErrorEnum,
  type DateFrameworkType,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters";
import { AdapterDayjs } from "@salt-ds/date-adapters";
import { AdapterLuxon } from "@salt-ds/date-adapters";
import { AdapterMoment } from "@salt-ds/date-adapters";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
} from "@salt-ds/lab";

import * as datePickerStories from "@stories/date-picker/date-picker.stories";

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

// Create an array of adapters
const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

const {
  // Storybook wraps components in it's own LocalizationProvider, so do not compose Stories
  Range,
  RangeControlled,
  RangeWithConfirmation,
  RangeWithCustomPanel,
  RangeWithCustomParser,
  RangeWithFormField,
  RangeWithMinMaxDate,
} = datePickerStories as any;

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  adapters.forEach((adapter: SaltDateAdapter<DateFrameworkType>) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      const initialRangeDateValue = {
        startDate: "05 Jan 2025",
        endDate: "06 Jan 2025",
      };
      const initialRangeDate = {
        startDate: adapter.parse("05/01/2025", "DD/MM/YYYY").date,
        endDate: adapter.parse("06/01/2025", "DD/MM/YYYY").date,
      };

      const updatedRangeDate = {
        startDate: adapter.parse("15/01/2025", "DD/MM/YYYY").date,
        endDate: adapter.parse("16/01/2025", "DD/MM/YYYY").date,
      };

      it("SHOULD only be able to select a date between min/max", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <RangeWithMinMaxDate
            defaultSelectedDate={initialRangeDate}
            onSelectionChange={selectionChangeSpy}
            selectionVariant={"range"}
          />,
        );
        // Simulate opening the calendar
        cy.findByRole("button", { name: "Open Calendar" }).realClick();
        // Verify that the calendar is displayed
        cy.findAllByRole("application").should("have.length", 2);
        // Verify that dates outside the min/max range are disabled
        cy.findByRole("button", {
          name: "14 January 2030",
        }).should("have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "15 January 2030",
        }).should("not.have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "15 January 2031",
        }).should("not.have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "16 January 2031",
        }).should("have.attr", "aria-disabled", "true");
        // Simulate selecting a date outside the min/max range
        cy.findByRole("button", {
          name: "14 January 2030",
        })
          .realHover()
          .realClick();
        cy.findAllByRole("application").should("have.length", 2);
        cy.get("@selectionChangeSpy").should("not.have.been.called");
        // Simulate selecting a date within the min/max range
        cy.findByRole("button", {
          name: "15 January 2030",
        }).realClick();
        cy.findByRole("button", {
          name: "15 January 2031",
        }).realClick();
        // Verify that the calendar is closed and the selected dates are displayed
        cy.findByRole("application").should("not.exist");
        cy.findByLabelText("Start date").should("have.value", "15 Jan 2030");
        cy.findByLabelText("End date").should("have.value", "15 Jan 2031");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            "15 Jan 2030",
          );
          expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
            "15 Jan 2031",
          );
          expect(details).to.be.undefined;
        });
      });

      it("SHOULD support validation", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <RangeWithFormField
            selectionVariant={"range"}
            onSelectionChange={selectionChangeSpy}
          />,
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
        cy.get("@selectionChangeSpy").should("have.been.calledOnce");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            "05 Jan 2025",
          );
          expect(date.endDate).to.be.undefined;
          expect(details).to.deep.equal({
            startDate: { value: "05 Jan 2025" },
            endDate: undefined,
          });
        });

        // Simulate entering an valid end date
        cy.findByLabelText("End date")
          .clear()
          .type(initialRangeDateValue.endDate);
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.been.calledTwice");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            "05 Jan 2025",
          );
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
            "06 Jan 2025",
          );
          expect(details).to.deep.equal({
            startDate: { value: "05 Jan 2025" },
            endDate: { value: "06 Jan 2025" },
          });
        });
        // Simulate entering an invalid end date
        cy.findByLabelText("End date").clear().type("bad date");
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.been.calledThrice");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            "05 Jan 2025",
          );
          expect(adapter.isValid(date.endDate)).to.be.false;
          expect(details).to.deep.equal({
            startDate: { value: "05 Jan 2025" },
            endDate: {
              value: "bad date",
              errors: [
                {
                  type: DateDetailErrorEnum.INVALID_DATE,
                  message: "not a valid date",
                },
              ],
            },
          });
        });
      });

      it("SHOULD support custom panel with tenors", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <RangeWithCustomPanel
            selectionVariant={"range"}
            onSelectionChange={selectionChangeSpy}
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
        const startDate = adapter.today();
        const endDate = adapter.add(startDate, { years: 15 });
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            adapter.format(startDate, "DD MMM YYYY"),
          );
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
            adapter.format(endDate, "DD MMM YYYY"),
          );
        });
        cy.findByLabelText("Start date").should(
          "have.value",
          adapter.format(startDate, "DD MMM YYYY"),
        );
        cy.findByLabelText("End date").should(
          "have.value",
          adapter.format(endDate, "DD MMM YYYY"),
        );
      });

      describe("SHOULD support confirmation", () => {
        it("SHOULD cancel un-confirmed selections", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          const appliedDateSpy = cy.stub().as("appliedDateSpy");
          const cancelSpy = cy.stub().as("cancelSpy");
          cy.mount(
            <RangeWithConfirmation
              selectionVariant={"range"}
              defaultSelectedDate={initialRangeDate}
              onSelectionChange={selectionChangeSpy}
              onApply={appliedDateSpy}
              onCancel={cancelSpy}
            />,
          );
          // Verify that the initial selected dates are displayed
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          // Simulate selecting an unconfirmed date
          cy.findByRole("button", {
            name: "15 January 2025",
          }).realClick();
          cy.findByRole("button", {
            name: "16 January 2025",
          }).realClick();
          cy.findAllByRole("application").should("have.length", 2);
          cy.findByLabelText("Start date").should("have.value", "15 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "16 Jan 2025");
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date] = spy.lastCall.args;
            expect(adapter.isValid(date.startDate)).to.be.true;
            expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
              adapter.format(updatedRangeDate.startDate, "DD MMM YYYY"),
            );
            expect(adapter.isValid(date.endDate)).to.be.true;
            expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
              adapter.format(updatedRangeDate.endDate, "DD MMM YYYY"),
            );
          });
          // Simulate clicking the "Cancel" button
          cy.findByRole("button", { name: "Cancel" }).realClick();
          // Verify that the calendar is closed and the initial selected dates are restored
          cy.findByRole("application").should("not.exist");
          cy.get("@appliedDateSpy").should("not.have.been.called");
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          cy.get("@cancelSpy").should("have.been.called");
        });

        it("SHOULD apply confirmed selections", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          const appliedDateSpy = cy.stub().as("appliedDateSpy");
          const cancelSpy = cy.stub().as("cancelSpy");
          cy.mount(
            <RangeWithConfirmation
              selectionVariant={"range"}
              defaultSelectedDate={initialRangeDate}
              onSelectionChange={selectionChangeSpy}
              onApply={appliedDateSpy}
              onCancel={cancelSpy}
            />,
          );
          // Verify that the initial selected dates are displayed
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          // Simulate selecting a new date range
          cy.findByRole("button", {
            name: "15 January 2025",
          }).realClick();
          cy.findAllByRole("application").should("have.length", 2);
          cy.findByRole("button", {
            name: "16 January 2025",
          }).realClick();
          // Verify that the new date range is displayed
          cy.findByLabelText("Start date").should("have.value", "15 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "16 Jan 2025");
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date] = spy.lastCall.args;
            expect(adapter.isValid(date.startDate)).to.be.true;
            expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
              adapter.format(updatedRangeDate.startDate, "DD MMM YYYY"),
            );
            expect(adapter.isValid(date.endDate)).to.be.true;
            expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
              adapter.format(updatedRangeDate.endDate, "DD MMM YYYY"),
            );
          });
          cy.findAllByRole("application").should("have.length", 2);
          // Simulate clicking the "Apply" button
          cy.findByRole("button", { name: "Apply" }).realClick();
          // Verify that the calendar is closed and the new date range is applied
          cy.findByRole("application").should("not.exist");
          cy.get("@appliedDateSpy").should((spy: any) => {
            const [_event, date] = spy.lastCall.args;
            expect(adapter.isValid(date.startDate)).to.be.true;
            expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
              adapter.format(updatedRangeDate.startDate, "DD MMM YYYY"),
            );
            expect(adapter.isValid(date.endDate)).to.be.true;
            expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
              adapter.format(updatedRangeDate.endDate, "DD MMM YYYY"),
            );
          });
          cy.findByLabelText("Start date").should("have.value", "15 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "16 Jan 2025");
          cy.get("@cancelSpy").should("not.have.been.called");
        });
      });

      it("SHOULD support custom parsing", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <RangeWithCustomParser
            onSelectionChange={selectionChangeSpy}
            defaultSelectedDate={initialRangeDate}
          />,
        );
        // Simulate entering a custom parsed start date
        cy.findByLabelText("Start date").clear().type("+7");
        cy.realPress("Tab");
        const offsetStartDate = adapter.add(initialRangeDate.startDate, {
          days: 7,
        });
        const offsetStartDateValue = adapter.format(
          offsetStartDate,
          "DD MMM YYYY",
        );
        cy.findByLabelText("Start date").should(
          "have.value",
          offsetStartDateValue,
        );
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            offsetStartDateValue,
          );
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
            initialRangeDateValue.endDate,
          );
        });
        // Simulate entering a custom parsed end date
        cy.findByLabelText("End date").clear().type("+7");
        cy.realPress("Tab");
        const offsetEndDate = adapter.add(initialRangeDate.endDate, {
          days: 7,
        });
        const offsetEndDateValue = adapter.format(offsetEndDate, "DD MMM YYYY");
        cy.findByLabelText("End date").should("have.value", offsetEndDateValue);
        cy.get("@selectionChangeSpy").should("have.been.calledTwice");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(adapter.format(date.startDate, "DD MMM YYYY")).to.equal(
            offsetStartDateValue,
          );
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
            offsetEndDateValue,
          );
        });
        cy.findByLabelText("Start date").should(
          "have.value",
          offsetStartDateValue,
        );
        cy.findByLabelText("End date").should("have.value", offsetEndDateValue);
      });

      describe("uncontrolled component", () => {
        it("SHOULD render the default date", () => {
          cy.mount(<Range defaultSelectedDate={initialRangeDate} />);
          // Verify that the selected dates are displayed
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          // Verify that the default selected dates are highlighted in the calendar
          cy.findByRole("button", {
            name: "05 January 2025",
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: "06 January 2025",
          }).should("have.attr", "aria-pressed", "true");
        });

        it("SHOULD be able to select a date", () => {
          cy.mount(<Range defaultSelectedDate={initialRangeDate} />);
          // Verify the initial range date is selected
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          // Simulate selecting a new start date
          cy.findByRole("button", {
            name: "15 January 2025",
          }).should("exist");
          cy.findByRole("button", {
            name: "15 January 2025",
          }).realClick();
          // Verify that the new date range resets the end date, whilst the calendar is open
          cy.findByLabelText("End date").should("have.value", "");
          // Simulate selecting a new end date
          cy.findByRole("button", {
            name: "16 January 2025",
          }).should("exist");
          cy.findByRole("button", {
            name: "16 January 2025",
          }).realClick();
          // Verify that the calendar is closed and the new date range is displayed
          cy.findByRole("application").should("not.exist");
          cy.findByRole("button", { name: "Open Calendar" }).should(
            "have.focus",
          );
          cy.findByLabelText("Start date").should("have.value", "15 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "16 Jan 2025");
        });
      });

      describe("controlled component", () => {
        it("SHOULD render the selected date", () => {
          cy.mount(
            <RangeControlled
              selectionVariant={"range"}
              defaultSelectedDate={initialRangeDate}
            />,
          );
          // Verify that the selected dates are displayed
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          // Verify that the selected dates are highlighted in the calendar
          cy.findByRole("button", {
            name: "05 January 2025",
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: "06 January 2025",
          }).should("have.attr", "aria-pressed", "true");
        });

        it("SHOULD be able to select a date", () => {
          cy.mount(
            <RangeControlled
              selectionVariant={"range"}
              defaultSelectedDate={initialRangeDate}
            />,
          );
          // Verify the initial range date is selected
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          // Simulate selecting a new start date
          cy.findByRole("button", {
            name: "15 January 2025",
          }).should("exist");
          cy.findByRole("button", {
            name: "15 January 2025",
          }).realClick();
          // Verify that the new date range resets the end date, whilst the calendar is open
          cy.findByLabelText("End date").should("have.value", "");
          // Simulate selecting a new end date
          cy.findByRole("button", {
            name: "16 January 2025",
          }).should("exist");
          cy.findByRole("button", {
            name: "16 January 2025",
          }).realClick();
          // Verify that the calendar is closed and the new date range is displayed
          cy.findByRole("application").should("not.exist");
          cy.findByRole("button", { name: "Open Calendar" }).should(
            "have.focus",
          );
          cy.findByLabelText("Start date").should("have.value", "15 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "16 Jan 2025");
        });
      });

      it("SHOULD preserve original time during date selection", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        const defaultStartDate = adapter.date("2024-12-11T00:09:30Z", "UTC");
        const defaultEndDate = adapter.date("2024-12-11T00:10:33Z", "UTC");
        cy.mount(
          <DatePicker
            defaultSelectedDate={{
              startDate: defaultStartDate,
              endDate: defaultEndDate,
            }}
            selectionVariant="range"
            onSelectionChange={selectionChangeSpy}
          >
            <DatePickerRangeInput />
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
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date.startDate)).to.be.true;
          expect(
            adapter.format(date.startDate, "DD MMM YYYY HH:mm:ss"),
          ).to.equal("05 Jan 2025 00:09:30");
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.endDate, "DD MMM YYYY HH:mm:ss")).to.equal(
            "06 Jan 2025 00:10:33",
          );
          expect(details).to.deep.equal({
            startDate: { value: "05 Jan 2025" },
            endDate: { value: "06 Jan 2025" },
          });
        });
      });
    });
  });
});
