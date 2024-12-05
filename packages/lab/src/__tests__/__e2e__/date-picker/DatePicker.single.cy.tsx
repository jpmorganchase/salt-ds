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
  DatePickerSingleInput,
  DatePickerSinglePanel,
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
  Single,
  SingleControlled,
  SingleWithConfirmation,
  SingleWithCustomPanel,
  SingleWithCustomParser,
  SingleWithFormField,
  SingleWithMinMaxDate,
  SingleWithTodayButton,
  SingleCustomFormat,
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

      const initialDateValue = "05 Jan 2025";
      const initialDate = adapter.parse("05 Jan 2025", "DD MMM YYYY").date;

      const updatedFormattedDateValue = "06 Jan 2025";
      const updatedDate = adapter.parse("06 Jan 2025", "DD MMM YYYY").date;

      it("SHOULD support validation", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <SingleWithFormField onSelectionChange={selectionChangeSpy} />,
        );
        // Simulate entering a valid date
        cy.findByRole("textbox").click().clear().type(initialDateValue);
        cy.realPress("Tab");
        cy.findByRole("textbox").should("have.value", initialDateValue);
        cy.get("@selectionChangeSpy").should("have.been.calledOnce");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal(
            initialDateValue,
          );
          expect(details).to.deep.equal({
            value: initialDateValue,
          });
        });
        // Simulate entering an invalid date
        cy.findByRole("textbox").click().clear().type("bad date");
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.been.calledTwice");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.false;
          expect(details).to.deep.equal({
            value: "bad date",
            errors: [
              {
                type: DateDetailErrorEnum.INVALID_DATE,
                message: "not a valid date",
              },
            ],
          });
        });
        // Different invalid date should call the event
        cy.findByRole("textbox").click().clear().type("another bad date 2");
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.callCount", 3);
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.false;
          expect(details).to.deep.equal({
            value: "another bad date 2",
            errors: [
              {
                type: DateDetailErrorEnum.INVALID_DATE,
                message: "not a valid date",
              },
            ],
          });
        });
        cy.findByRole("textbox")
          .click()
          .clear()
          .type(updatedFormattedDateValue);
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.callCount", 4);
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal(
            updatedFormattedDateValue,
          );
          expect(details).to.deep.equal({
            value: updatedFormattedDateValue,
          });
        });
      });

      it("SHOULD only be able to select a date between min/max", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <SingleWithMinMaxDate
            defaultSelectedDate={initialDate}
            onSelectionChange={selectionChangeSpy}
          />,
        );
        // Simulate opening the calendar
        cy.findByRole("button", { name: "Open Calendar" }).realClick();
        // Verify that the calendar is displayed
        cy.findByRole("application").should("exist");
        // Verify that dates outside the min/max range are disabled
        cy.findByRole("button", {
          name: "14 January 2030",
        }).should("have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "15 January 2030",
        }).should("not.have.attr", "aria-disabled", "true");
        // Simulate selecting a year from the dropdown
        cy.findByRole("combobox", {
          name: "Year Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: "2031",
        })
          .realHover()
          .realClick();
        // Verify that dates outside the min/max range are disabled
        cy.findByRole("button", {
          name: "15 January 2031",
        }).should("not.have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "16 January 2031",
        }).should("have.attr", "aria-disabled", "true");
        // Simulate selecting a date outside the min/max range
        cy.findByRole("button", {
          name: "16 January 2031",
        })
          .realHover()
          .realClick();
        cy.findByRole("application").should("exist");
        cy.get("@selectionChangeSpy").should("not.have.been.called");
        // Simulate selecting a date within the min/max range
        cy.findByRole("button", {
          name: "15 January 2031",
        }).realClick();
        // Verify that the calendar is closed and the selected date is displayed
        cy.findByRole("application").should("not.exist");
        cy.findByRole("textbox").should("have.value", "15 Jan 2031");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal("15 Jan 2031");
          expect(details).to.be.undefined;
        });
      });

      it("SHOULD support custom panel with tenors", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <SingleWithCustomPanel onSelectionChange={selectionChangeSpy} />,
        );
        // Simulate opening the calendar
        cy.findByRole("button", { name: "Open Calendar" }).realClick();
        // Verify that the calendar is displayed
        cy.findByRole("application").should("exist");
        // Simulate selecting a tenor option
        cy.findByRole("option", {
          name: "15 years",
        })
          .realHover()
          .realClick();
        // Verify that the calendar is closed and the selected date is displayed
        cy.findByRole("application").should("not.exist");
        cy.realPress("Tab");
        const futureDate = adapter.add(adapter.today(), { years: 15 });
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal(
            adapter.format(futureDate, "DD MMM YYYY"),
          );
          expect(details).to.be.undefined;
        });
        cy.findByRole("textbox").should(
          "have.value",
          adapter.format(futureDate, "DD MMM YYYY"),
        );
      });

      it("SHOULD support custom panel with Today button", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <SingleWithTodayButton onSelectionChange={selectionChangeSpy} />,
        );
        // Simulate opening the calendar
        cy.findByRole("button", { name: "Open Calendar" }).realClick();
        // Verify that the calendar is displayed
        cy.findByRole("application").should("exist");
        // Simulate clicking the "Select Today" button
        cy.findByRole("button", { name: "Select Today" }).realClick();
        // Verify that the calendar is closed and today's date is displayed
        cy.findByRole("application").should("not.exist");
        cy.realPress("Tab");
        const today = adapter.today();
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal(
            adapter.format(today, "DD MMM YYYY"),
          );
          expect(details).to.be.undefined;
        });
        cy.findByRole("textbox").should(
          "have.value",
          adapter.format(today, "DD MMM YYYY"),
        );
      });

      describe("SHOULD support confirmation", () => {
        it("SHOULD cancel un-confirmed selections", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          const appliedDateSpy = cy.stub().as("appliedDateSpy");
          const cancelSpy = cy.stub().as("cancelSpy");
          cy.mount(
            <SingleWithConfirmation
              defaultSelectedDate={initialDate}
              onSelectionChange={selectionChangeSpy}
              onApply={appliedDateSpy}
              onCancel={cancelSpy}
            />,
          );
          // Verify that the initial selected date is displayed
          cy.document()
            .find("input")
            .first()
            .should("have.value", initialDateValue);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Simulate selecting an unconfirmed date
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "DD MMMM YYYY"),
          }).realClick();
          cy.findByRole("application").should("exist");
          cy.document()
            .find("input")
            .should("have.value", adapter.format(updatedDate, "DD MMM YYYY"));
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date, details] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMM YYYY")).to.equal(
              adapter.format(updatedDate, "DD MMM YYYY"),
            );
            expect(details).to.be.undefined;
          });
          // Simulate clicking the "Cancel" button
          cy.findByRole("button", { name: "Cancel" }).realClick();
          // Verify that the calendar is closed and the initial selected date is restored
          cy.findByRole("application").should("not.exist");
          cy.get("@appliedDateSpy").should("not.have.been.called");
          cy.document().find("input").should("have.value", initialDateValue);
          cy.get("@cancelSpy").should("have.been.called");
        });

        it("SHOULD apply confirmed selections", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          const appliedDateSpy = cy.stub().as("appliedDateSpy");
          const cancelSpy = cy.stub().as("cancelSpy");
          cy.mount(
            <SingleWithConfirmation
              defaultSelectedDate={initialDate}
              onSelectionChange={selectionChangeSpy}
              onApply={appliedDateSpy}
              onCancel={cancelSpy}
            />,
          );
          // Verify that the initial selected date is displayed
          cy.document()
            .find("input")
            .first()
            .should("have.value", initialDateValue);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Simulate selecting a new date
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "DD MMMM YYYY"),
          }).realClick();
          cy.findByRole("application").should("exist");
          cy.document()
            .find("input")
            .should("have.value", updatedFormattedDateValue);
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date, details] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMM YYYY")).to.equal(
              adapter.format(updatedDate, "DD MMM YYYY"),
            );
            expect(details).to.be.undefined;
          });
          // Simulate clicking the "Apply" button
          cy.findByRole("button", { name: "Apply" }).realClick();
          // Verify that the calendar is closed and the new date is applied
          cy.findByRole("application").should("not.exist");
          // cy.get("@appliedDateSpy").should(
          //   "have.been.calledWith",
          //   Cypress.sinon.match.any,
          //   updatedDate,
          // );
          cy.get("@appliedDateSpy").should((spy: any) => {
            const [_event, date] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMM YYYY")).to.equal(
              adapter.format(updatedDate, "DD MMM YYYY"),
            );
          });
          cy.document()
            .find("input")
            .should("have.value", updatedFormattedDateValue);
        });
      });

      it("SHOULD support custom parsing", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <SingleWithCustomParser onSelectionChange={selectionChangeSpy} />,
        );
        // Simulate entering a valid date
        cy.findByRole("textbox").click().clear().type(initialDateValue);
        cy.realPress("Tab");
        cy.findByRole("textbox").should("have.value", initialDateValue);
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal(
            initialDateValue,
          );
          expect(details).to.deep.equal({
            value: initialDateValue,
          });
        });
        // Simulate entering a custom parsed date
        cy.findByRole("textbox").click().clear().type("+7");
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.been.calledTwice");
        const futureDate = adapter.add(initialDate, { days: 7 });
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal(
            adapter.format(futureDate, "DD MMM YYYY"),
          );
          expect(details).to.deep.equal({
            value: "+7",
          });
        });
        cy.document()
          .find("input")
          .should("have.value", adapter.format(futureDate, "DD MMM YYYY"));
      });

      describe("uncontrolled component", () => {
        it("SHOULD render the default date", () => {
          cy.mount(<Single defaultSelectedDate={initialDate} />);
          // Verify that the default selected date is displayed
          cy.findByRole("textbox").should("have.value", initialDateValue);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Verify that the default selected date is highlighted in the calendar
          cy.findByRole("button", {
            name: adapter.format(initialDate, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
        });

        it("SHOULD be able to select a date", () => {
          cy.mount(<Single defaultSelectedDate={initialDate} />);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Simulate selecting a new date
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "DD MMMM YYYY"),
          }).should("exist");
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "DD MMMM YYYY"),
          }).realClick();
          // Verify that the calendar is closed and the new date is displayed
          cy.findByRole("application").should("not.exist");
          cy.findByRole("button", { name: "Open Calendar" }).should(
            "have.focus",
          );
          cy.findByRole("textbox").should(
            "have.value",
            updatedFormattedDateValue,
          );
        });
      });

      describe("controlled component", () => {
        it("SHOULD render the selected date", () => {
          cy.mount(<SingleControlled defaultSelectedDate={initialDate} />);
          // Verify that the selected date is displayed
          cy.findByRole("textbox").should("have.value", initialDateValue);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Verify that the selected date is highlighted in the calendar
          cy.findByRole("button", {
            name: adapter.format(initialDate, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
        });

        it("SHOULD be able to select a date", () => {
          cy.mount(<SingleControlled defaultSelectedDate={initialDate} />);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Simulate selecting a new date
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "DD MMMM YYYY"),
          }).should("exist");
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "DD MMMM YYYY"),
          }).realClick();
          // Verify that the calendar is closed and the new date is displayed
          cy.findByRole("application").should("not.exist");
          cy.findByRole("button", { name: "Open Calendar" }).should(
            "have.focus",
          );
          cy.findByRole("textbox").should(
            "have.value",
            updatedFormattedDateValue,
          );

          // Reset/set programatically
          cy.findByLabelText("today").realClick();
          cy.findByRole("textbox").should(
            "have.value",
            adapter.format(adapter.today(), "DD MMMM YYYY"),
          );
          cy.findByLabelText("reset").realClick();
          cy.findByRole("textbox").should("have.value", "");
        });

        it("SHOULD preserve original time during date selection", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          const defaultSelectedDate = adapter.date(
            "2024-12-11T00:09:30Z",
            "UTC",
          );
          cy.mount(
            <DatePicker
              defaultSelectedDate={defaultSelectedDate}
              selectionVariant="single"
              onSelectionChange={selectionChangeSpy}
            >
              <DatePickerSingleInput />
              <DatePickerOverlay>
                <DatePickerSinglePanel />
              </DatePickerOverlay>
            </DatePicker>,
          );
          // Simulate entering a valid date
          cy.findByRole("textbox").click().clear().type(initialDateValue);
          cy.realPress("Tab");
          cy.findByRole("textbox").should("have.value", initialDateValue);
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date, details] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMM YYYY HH:mm:ss")).to.equal(
              "05 Jan 2025 00:09:30",
            );
            expect(details).to.deep.equal({
              value: initialDateValue,
            });
          });
        });

        it("SHOULD support format prop on the input", () => {
          const format = "YYYY-MM-DD";

          cy.mount(
            <SingleCustomFormat
              format={format}
              defaultSelectedDate={initialDate}
            />,
          );
          cy.findByRole("textbox").should("have.value", "2025-01-05");
        });
      });
    });
  });
});
