import {
  DateDetailError,
  type DateFrameworkType,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
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
  ControlledOpen,
  Single,
  SingleControlled,
  SingleWithConfirmation,
  SingleWithCustomPanel,
  SingleWithCustomParser,
  SingleWithFormField,
  SingleWithMinMaxDate,
  SingleWithTodayButton,
  SingleWithUnselectableDates,
  SingleCustomFormat,
  SingleWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: storybook stories
} = datePickerStories as any;

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  describe("WHEN default state", () => {
    beforeEach(() => {
      const today = new Date(2024, 4, 6);
      cy.clock(today, ["Date"]);
      cy.setDateAdapter(adapterDateFns);
    });

    afterEach(() => {
      cy.clock().then((clock) => clock.restore());
    });

    it("SHOULD show calendar overlay when click the calendar icon button", () => {
      cy.mount(<Single />);
      cy.findByRole("button", { name: "Open Calendar" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findByRole("application").should("exist");
      // cy.get used as we query elements which are non-visible when dialog is open
      cy.get('button[aria-label="Open Calendar"]')
        .should("exist")
        .and("have.attr", "aria-expanded", "true");
    });

    it("SHOULD open calendar overlay when using down arrow", () => {
      cy.mount(<Single />);
      cy.findByRole("button", { name: "Open Calendar" }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );

      cy.findByRole("textbox").click().type("{downArrow}", { force: true });
      // Verify that the calendar is displayed
      cy.findByRole("application").should("exist");
      // cy.get used as we query elements which are non-visible when dialog is open
      cy.get('button[aria-label="Open Calendar"]')
        .should("exist")
        .and("have.attr", "aria-expanded", "true");
    });

    it("SHOULD be able to enable the overlay to open on click", () => {
      cy.mount(<Single openOnClick />);
      cy.findByRole("application").should("not.exist");
      // Simulate opening the calendar on click
      cy.document().find("input").realClick();
      cy.findByRole("application").should("exist");
    });

    it("SHOULD NOT be able to enable the overlay to open on click, if disabled", () => {
      cy.mount(<Single openOnClick disabled />);
      cy.findByRole("application").should("not.exist");
      // Simulate opening the calendar on click
      cy.document().find("input").realClick();
      cy.findByRole("application").should("not.exist");
    });

    it("SHOULD hide calendar upon focus out", () => {
      cy.mount(<Single />);

      // Simulate opening the calendar
      cy.findByRole("textbox").click().type("{downArrow}", { force: true });
      // Verify the overlay opens
      cy.findByRole("application").should("exist");
      // Simulate re-focusing the input
      cy.document().find("input").realClick();
      // Simulate tabbing
      cy.realPress("Tab");
      cy.findByRole("application").should("exist");
      // Simulate focus out
      cy.get("body").click(0, 0);
      // Verify the overlay closes
      cy.findByRole("application").should("not.exist");
    });

    it("SHOULD be able to control the overlay open state", () => {
      cy.mount(<ControlledOpen />);
      cy.findByRole("application").should("not.exist");
      // Simulate opening the calendar through a controlled state
      cy.document().find("input").realClick();
      cy.findByRole("application").should("not.exist");
      // Simulate overlay closing when cancelled
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
      cy.findByRole("button", { name: "Cancel no date selected" }).realClick();
      cy.findByRole("application").should("not.exist");
      // Simulate overlay closing when date applied
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");
      cy.findByRole("button", { name: "Apply no date selected" }).realClick();
      // Verify that the calendar is closed and the new date is applied
      cy.findByRole("application").should("not.exist");
    });
  });

  describe("WHEN readOnly", () => {
    beforeEach(() => {
      const today = new Date(2024, 4, 6);
      cy.clock(today, ["Date"]);
      cy.setDateAdapter(adapterDateFns);
    });

    afterEach(() => {
      cy.clock().then((clock) => clock.restore());
    });

    it("SHOULD not show calendar icon button", () => {
      cy.mount(<Single readOnly />);
      cy.findByRole("button", { name: "Open Calendar" }).should("not.exist");
    });

    it("SHOULD not open overlay when using down arrow", () => {
      cy.mount(<Single readOnly />);
      cy.findByRole("textbox").click().type("{downArrow}", { force: true });
      cy.findByRole("application").should("not.exist");
    });

    it("SHOULD not open overlay if defaultOpen is set", () => {
      cy.mount(<Single readOnly defaultOpen />);
      cy.findByRole("application").should("not.exist");
    });
  });

  describe("WHEN disabled", () => {
    beforeEach(() => {
      const today = new Date(2024, 4, 6);
      cy.clock(today, ["Date"]);
      cy.setDateAdapter(adapterDateFns);
    });

    afterEach(() => {
      cy.clock().then((clock) => clock.restore());
    });

    it("SHOULD disable calendar button and input", () => {
      cy.mount(<Single disabled />);
      cy.findByRole("button", { name: "Open Calendar" }).should(
        "have.attr",
        "disabled",
      );
      cy.findByRole("textbox").should("have.attr", "disabled");
    });
  });

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

      it("SHOULD be able to tab between all elements", () => {
        cy.mount(<Single defaultSelectedDate={initialDate} />);

        // Simulate opening the overlay
        cy.findByRole("textbox").click().type("{downArrow}", { force: true });
        // Verify that the calendar is opened
        cy.findByRole("application").should("exist");
        // Verify the first element is focused
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(initialDate, "dddd D MMMM YYYY")}`,
        }).should("be.focused");
        // Simulate tabbing between all elements in the overlay
        cy.realPress("Tab");
        cy.findByLabelText("Previous Month").should("be.focused");
        cy.realPress("Tab");
        cy.findByLabelText("Month Dropdown").should("be.focused");
        cy.realPress("Tab");
        cy.findByLabelText("Year Dropdown").should("be.focused");
        cy.realPress("Tab");
        cy.findByLabelText("Next Month").should("be.focused");
        cy.realPress("Tab");
        // Verify focus returns to the first element in the overlay
        cy.findByRole("button", {
          name: `Selected date: ${adapter.format(initialDate, "dddd D MMMM YYYY")}`,
        }).should("be.focused");
        // Simulate closing the overlay
        cy.realPress("Escape");
        // Verify that the calendar is closed
        cy.findByRole("application").should("not.exist");
        // Verify focus returns to the triggering element
        cy.findByRole("textbox").should("be.focused");
        // Simulate tabbing to the calendar button
        cy.realPress("Tab");
        // Verify the calendar button is focused
        cy.findByLabelText("Open Calendar").should("be.focused");
        // Simulate tabbing out of the date picker
        cy.realPress("Tab");
        // Verify the date picker loses focus
        cy.findByLabelText("Open Calendar").should("not.be.focused");
      });

      it("SHOULD support validation", () => {
        const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
        cy.mount(
          <SingleWithFormField onSelectionChange={selectionChangeSpy} />,
        );
        // Simulate entering a valid date
        cy.findByRole("textbox").click().clear().type(initialDateValue);
        cy.realPress("Tab");
        cy.findByRole("textbox").should("have.value", initialDateValue);
        // Verify there is a valid date change event
        cy.get("@selectionChangeSpy").should("have.been.calledOnce");
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // Verify there is a invalid date change event
        cy.get("@selectionChangeSpy").should("have.been.calledTwice");
        // biome-ignore lint/suspicious/noExplicitAny: spy
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.false;
          expect(details).to.deep.equal({
            value: "bad date",
            errors: [
              {
                type: DateDetailError.INVALID_DATE,
                message: "not a valid date",
              },
            ],
          });
        });
        // Simulate entering another invalid date
        cy.findByRole("textbox").click().clear().type("another bad date 2");
        cy.realPress("Tab");
        // Verify there is another invalid date change event
        cy.get("@selectionChangeSpy").should("have.callCount", 3);
        // biome-ignore lint/suspicious/noExplicitAny: spy
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.false;
          expect(details).to.deep.equal({
            value: "another bad date 2",
            errors: [
              {
                type: DateDetailError.INVALID_DATE,
                message: "not a valid date",
              },
            ],
          });
        });
        // Simulate correcting the date
        cy.findByRole("textbox")
          .click()
          .clear()
          .type(updatedFormattedDateValue);
        cy.realPress("Tab");
        // Verify there is a valid date change event
        cy.get("@selectionChangeSpy").should("have.callCount", 4);
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // Give the focus but don't change the date
        cy.findByRole("textbox").focus();
        cy.realPress("Tab");
        cy.findByRole("textbox").should(
          "have.value",
          updatedFormattedDateValue,
        );
        // Verify there is no change event
        cy.get("@selectionChangeSpy").should("have.callCount", 4);
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
        // Verify the navigation controls do not allow to navigate beyond the min/max
        cy.findByLabelText("Past dates are out of range").should(
          "have.attr",
          "aria-disabled",
          "true",
        );
        cy.findByLabelText("Next Month").should(
          "not.have.attr",
          "aria-disabled",
          "true",
        );
        // Verify first selectable date in range is focused
        cy.findByRole("button", {
          name: "Tuesday 15 January 2030",
        }).should("be.focused");
        // Verify that dates outside the min/max range are disabled
        cy.findByRole("button", {
          name: "Monday 14 January 2030",
        }).should("have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "Tuesday 15 January 2030",
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
        // Verify the navigation controls do not allow to navigate beyond the min/max
        cy.findByLabelText("Previous Month").should(
          "not.have.attr",
          "aria-disabled",
          "true",
        );
        cy.findByLabelText("Future dates are out of range").should(
          "have.attr",
          "aria-disabled",
          "true",
        );
        // Verify that dates outside the min/max range are disabled
        cy.findByRole("button", {
          name: "Wednesday 15 January 2031",
        }).should("not.have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: "Thursday 16 January 2031",
        }).should("have.attr", "aria-disabled", "true");
        // Simulate selecting a date outside the min/max range
        cy.findByRole("button", {
          name: "Thursday 16 January 2031",
        })
          .realHover()
          .realClick();
        cy.findByRole("application").should("exist");
        cy.get("@selectionChangeSpy").should("not.have.been.called");
        // Simulate selecting a date within the min/max range
        cy.findByRole("button", {
          name: "Wednesday 15 January 2031",
        }).realClick();
        // Verify that the calendar is closed and the selected date is displayed
        cy.findByRole("application").should("not.exist");
        cy.findByRole("textbox").should("have.value", "15 Jan 2031");
        // biome-ignore lint/suspicious/noExplicitAny: spy
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(adapter.isValid(date)).to.be.true;
          expect(adapter.format(date, "DD MMM YYYY")).to.equal("15 Jan 2031");
          expect(details).to.be.undefined;
        });
      });

      it("SHOULD render helper text in the panel when opened ", () => {
        cy.mount(<SingleWithFormField />);
        // Verify the helper text is visible on the page
        cy.get('[id^="helperText-"]')
          .filter((index, element) => {
            return !Cypress.$(element).closest("[data-floating-ui-portal]")
              .length;
          })
          .should("be.visible");
        // Simulate opening the calendar
        cy.findByRole("button", { name: "Open Calendar" }).realClick();
        // Verify that the dialog is opened
        cy.findByRole("application").should("exist");
        // Verify the helper text is not visible on the page
        cy.get('[id^="helperText-"]')
          .filter((index, element) => {
            return !Cypress.$(element).closest("[data-floating-ui-portal]")
              .length;
          })
          .should("not.be.visible");
        // Verify the helper text has moved to the dialog panel
        cy.get('[id^="helperText-"]')
          .filter((index, element) => {
            return Cypress.$(element).closest('[role="dialog"]').length > 0;
          })
          .should("be.visible");
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
        cy.findByRole("button", {
          name: "15 years",
        })
          .realHover()
          .realClick();
        // Verify that the calendar is closed and the selected date is displayed
        cy.findByRole("application").should("not.exist");
        cy.realPress("Tab");
        const futureDate = adapter.add(adapter.today(), { years: 15 });
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
          }).realClick();
          cy.findByRole("application").should("exist");
          cy.document()
            .find("input")
            .should("have.value", adapter.format(updatedDate, "DD MMM YYYY"));
          // biome-ignore lint/suspicious/noExplicitAny: spy
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date, details] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMM YYYY")).to.equal(
              adapter.format(updatedDate, "DD MMM YYYY"),
            );
            expect(details).to.be.undefined;
          });
          // Simulate clicking the "Cancel" button
          cy.findByRole("button", {
            name: "Cancel Monday 6 January 2025",
          }).realClick();
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
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
          }).realClick();
          cy.findByRole("application").should("exist");
          cy.document()
            .find("input")
            .should("have.value", updatedFormattedDateValue);
          // biome-ignore lint/suspicious/noExplicitAny: spy
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date, details] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMM YYYY")).to.equal(
              adapter.format(updatedDate, "DD MMM YYYY"),
            );
            expect(details).to.be.undefined;
          });
          // Simulate clicking the "Apply" button
          cy.findByRole("button", {
            name: "Apply Monday 6 January 2025",
          }).realClick();
          // Verify that the calendar is closed and the new date is applied
          cy.findByRole("application").should("not.exist");
          // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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

      describe("timezone", () => {
        [
          { timezone: "default", expectedResult: "2025-01-05T00:00:00.000Z" },
          { timezone: "system", expectedResult: "2025-01-05T00:00:00.000Z" },
          { timezone: "UTC", expectedResult: "2025-01-05T00:00:00.000Z" },
          {
            timezone: "America/New_York",
            expectedResult: "2025-01-05T05:00:00.000Z",
          },
          {
            timezone: "Europe/London",
            expectedResult: "2025-01-05T00:00:00.000Z",
          },
          {
            timezone: "Asia/Shanghai",
            expectedResult: "2025-01-04T16:00:00.000Z",
          },
          {
            timezone: "Asia/Kolkata",
            expectedResult: "2025-01-04T18:30:00.000Z",
          },
        ].forEach(({ timezone, expectedResult }) => {
          if (adapter.lib === "date-fns" && timezone !== "default") {
            return;
          }
          it(`SHOULD render date in the ${timezone} timezone`, () => {
            cy.mount(<SingleWithTimezone />);
            // Simulate selecting timezone
            cy.findByLabelText("timezone dropdown").realClick();
            cy.findByRole("option", { name: timezone }).realHover().realClick();
            // Simulate selection of date
            cy.findByRole("textbox").click().clear().type(initialDateValue);
            cy.realPress("Tab");
            // Verify the ISO date
            cy.findByTestId("iso-date-label").should(
              "have.text",
              expectedResult,
            );
          });
        });
      });

      describe("uncontrolled component", () => {
        it("SHOULD render the default date", () => {
          cy.mount(<Single defaultSelectedDate={initialDate} />);
          // Verify that the default selected date is displayed
          cy.findByRole("textbox").should("have.value", initialDateValue);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" })
            .realClick()
            .type("{downArrow}", { force: true });
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          //Verify the selected date is focused
          cy.findByRole("button", {
            name: `Selected date: ${adapter.format(initialDate, "dddd D MMMM YYYY")}`,
          }).should("be.focused");
          // Verify that the default selected date is highlighted in the calendar
          cy.findByRole("button", {
            name: `Selected date: ${adapter.format(initialDate, "dddd D MMMM YYYY")}`,
          }).should("exist");
        });

        it("SHOULD be able to select a date", () => {
          cy.mount(<Single defaultSelectedDate={initialDate} />);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Simulate selecting a new date
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
          }).should("exist");
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
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
          cy.findByRole("button", { name: "Open Calendar" })
            .realClick()
            .type("{downArrow}", { force: true });
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          //Verify the selected date is focused
          cy.findByRole("button", {
            name: `Selected date: ${adapter.format(initialDate, "dddd D MMMM YYYY")}`,
          }).should("be.focused");
          // Verify that the selected date is highlighted in the calendar
          cy.findByRole("button", {
            name: `Selected date: ${adapter.format(initialDate, "dddd D MMMM YYYY")}`,
          }).should("exist");
        });

        it("SHOULD not be able to select un-selectable dates", () => {
          cy.mount(
            <SingleWithUnselectableDates defaultSelectedDate={initialDate} />,
          );

          const startDate = adapter.parse("01 Jan 2025", "DD MMM YYYY").date;
          const endDate = adapter.parse("31 Jan 2025", "DD MMM YYYY").date;
          let currentDate = adapter.clone(startDate);

          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");

          while (currentDate <= endDate) {
            const formattedDate = adapter.isSame(
              initialDate,
              currentDate,
              "day",
            )
              ? `Selected date: ${adapter.format(currentDate, "dddd D MMMM YYYY")}`
              : adapter.format(currentDate, "dddd D MMMM YYYY");
            const dayOfWeek = adapter.getDayOfWeek(currentDate);
            const isWeekend =
              (adapter.lib === "luxon" &&
                (dayOfWeek === 7 || dayOfWeek === 6)) ||
              (adapter.lib !== "luxon" && (dayOfWeek === 0 || dayOfWeek === 6));
            if (isWeekend) {
              // Verify weekend dates are disabled
              cy.findByRole("button", { name: formattedDate }).should(
                "have.attr",
                "aria-disabled",
                "true",
              );
            } else {
              // Verify weekday dates are enabled
              cy.findByRole("button", { name: formattedDate }).should(
                "not.have.attr",
                "aria-disabled",
                "true",
              );
            }
            currentDate = adapter.add(currentDate, { days: 1 });
          }
        });

        it("SHOULD be able to select a date", () => {
          cy.mount(<SingleControlled defaultSelectedDate={initialDate} />);
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findByRole("application").should("exist");
          // Simulate selecting a new date
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
          }).should("exist");
          cy.findByRole("button", {
            name: adapter.format(updatedDate, "dddd D MMMM YYYY"),
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
                <DatePickerSingleGridPanel />
              </DatePickerOverlay>
            </DatePicker>,
          );
          // Simulate entering a valid date
          cy.findByRole("textbox").click().clear().type(initialDateValue);
          cy.realPress("Tab");
          cy.findByRole("textbox").should("have.value", initialDateValue);
          // biome-ignore lint/suspicious/noExplicitAny: spy
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
