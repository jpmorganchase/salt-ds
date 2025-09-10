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
  RangeWithUnselectableDates,
  RangeCustomFormat,
  RangeWithTimezone,
  // biome-ignore lint/suspicious/noExplicitAny: storybook stories
} = datePickerStories as any;

describe("GIVEN a DatePicker where selectionVariant is range", () => {
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
      cy.mount(<Range />);

      // Simulate opening the calendar
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
    });

    it("SHOULD open calendar overlay when using down arrow", () => {
      cy.mount(<Range />);

      cy.findAllByRole("textbox")
        .eq(0)
        .click()
        .type("{downArrow}", { force: true });
      // Verify that the calendar is displayed
      cy.findAllByRole("application").should("have.length", 2);
    });

    it("SHOULD be able to enable the overlay to open on click", () => {
      cy.mount(<Range openOnClick />);
      cy.findByRole("application").should("not.exist");
      // Simulate opening the calendar on click
      cy.findByLabelText("Start date").realClick();
      cy.findAllByRole("application").should("have.length", 2);
      cy.document().find("body").realClick();
      cy.findByRole("application").should("not.exist");
      cy.findByLabelText("End date").realClick();
      cy.findAllByRole("application").should("have.length", 2);
    });

    it("SHOULD hide calendar upon focus out", () => {
      cy.mount(<Range />);

      // Simulate opening the calendar
      cy.findAllByRole("textbox")
        .eq(0)
        .click()
        .type("{downArrow}", { force: true });
      // Verify the overlay opens
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate re-focusing the input
      cy.findByLabelText("Start date").realClick();
      // Simulate tabbing to end date
      cy.realPress("Tab");
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate tabbing to calendar button
      cy.realPress("Tab");
      cy.findAllByRole("application").should("have.length", 2);
      // Simulate focus out
      cy.get("body").click(0, 0);
      // Verify the overlay closes
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
      cy.mount(<Range readOnly />);
      cy.findByRole("button", { name: "Open Calendar" }).should("not.exist");
    });

    it("SHOULD not open overlay when using down arrow", () => {
      cy.mount(<Range readOnly />);
      cy.findAllByRole("textbox")
        .eq(0)
        .click()
        .type("{downArrow}", { force: true });
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
      cy.mount(<Range disabled />);
      cy.findByRole("button", { name: "Open Calendar" }).should(
        "have.attr",
        "disabled",
      );
      cy.findByRole("textbox", { name: "Start date" }).should(
        "have.attr",
        "disabled",
      );
      cy.findByRole("textbox", { name: "End date" }).should(
        "have.attr",
        "disabled",
      );
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

      it("SHOULD be able to tab between all elements", () => {
        cy.mount(<Range defaultSelectedDate={initialRangeDate} />);

        // Simulate opening the overlay
        cy.findByLabelText("Start date")
          .click()
          .type("{downArrow}", { force: true });
        // Verify that the calendar is opened
        cy.findAllByRole("application").should("have.length", 2);
        // Verify the first element focused in the first calendar is the start date
        cy.findByRole("button", {
          name: adapter.format(initialRangeDate.startDate, "DD MMMM YYYY"),
        }).should("be.focused");
        // Simulate tabbing to the next calendar
        cy.realPress("Tab");
        // Verify the focused element(s) are the navigation controls
        cy.findAllByLabelText("Previous Month").eq(1).should("be.focused");
        cy.realPress("Tab");
        cy.findAllByLabelText("Month Dropdown").eq(1).should("be.focused");
        cy.realPress("Tab");
        cy.findAllByLabelText("Year Dropdown").eq(1).should("be.focused");
        cy.realPress("Tab");
        cy.findAllByLabelText("Next Month").eq(1).should("be.focused");
        // Simulate tabbing into the second calendar
        cy.realPress("Tab");
        // Verify the first day focused in the second calendar
        const startOfEndCalendar = adapter.startOf(
          adapter.add(initialRangeDate.startDate, { months: 1 }),
          "month",
        );
        cy.findByRole("button", {
          name: adapter.format(startOfEndCalendar, "DD MMMM YYYY"),
        }).should("be.focused");
        // Simulate tabbing back to the first calendar
        cy.realPress("Tab");
        // Verify the focused element(s) are the navigation controls
        cy.findAllByLabelText("Previous Month").first().should("be.focused");
        cy.realPress("Tab");
        cy.findAllByLabelText("Month Dropdown").first().should("be.focused");
        cy.realPress("Tab");
        cy.findAllByLabelText("Year Dropdown").first().should("be.focused");
        cy.realPress("Tab");
        cy.findAllByLabelText("Next Month").first().should("be.focused");
        // Simulate tabbing into the second calendar
        cy.realPress("Tab");
        // Verify focus returns to the first focused element in the first calendar
        cy.findByRole("button", {
          name: adapter.format(initialRangeDate.startDate, "DD MMMM YYYY"),
        }).should("be.focused");
        // Simulate closing the overlay
        cy.realPress("Escape");
        // Verify that the calendar is closed
        cy.findByRole("application").should("not.exist");
        // Verify focus returns to the triggering element
        cy.findByLabelText("Start date").should("be.focused");
        // Simulate tabbing to calendar button
        cy.realPress("Tab");
        // Verify focus returns to the triggering element
        cy.findByLabelText("End date").should("be.focused");
        cy.realPress("Tab");
        // Verify calendar button is focused
        cy.findByLabelText("Open Calendar").should("be.focused");
        // Simulate tabbing out of date picker
        cy.realPress("Tab");
        // Verify the date picker loses focus
        cy.findByLabelText("Open Calendar").should("not.be.focused");
      });

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
        // Verify the navigation controls do not allow to navigate beyond the min/max
        cy.findAllByLabelText("Previous Month")
          .eq(0)
          .should("have.attr", "aria-disabled", "true");
        cy.findAllByLabelText("Next Month")
          .eq(0)
          .should("not.have.attr", "aria-disabled", "true");
        cy.findAllByLabelText("Previous Month")
          .eq(1)
          .should("not.have.attr", "aria-disabled", "true");
        cy.findAllByLabelText("Next Month")
          .eq(1)
          .should("have.attr", "aria-disabled", "true");
        // Verify first selectable date in range is focused
        cy.findByRole("button", {
          name: "15 January 2030",
        }).should("be.focused");
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // Verify there is a valid change event
        cy.findByLabelText("Start date").should(
          "have.value",
          initialRangeDateValue.startDate,
        );
        cy.get("@selectionChangeSpy").should("have.been.calledOnce");
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
              value: "",
              errors: [
                {
                  type: DateDetailError.UNSET,
                  message: "no end date defined",
                },
              ],
            },
          });
        });

        // Simulate entering an valid end date
        cy.findByLabelText("End date")
          .clear()
          .type(initialRangeDateValue.endDate);
        cy.realPress("Tab");
        // Verify there is a valid change event
        cy.get("@selectionChangeSpy").should("have.been.calledTwice");
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // Verify there is an invalid change event
        cy.get("@selectionChangeSpy").should("have.been.calledThrice");
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
                  type: DateDetailError.INVALID_DATE,
                  message: "not a valid date",
                },
              ],
            },
          });
        });
        // Simulate correcting the date range
        cy.findByLabelText("Start date")
          .click()
          .clear()
          .type(initialRangeDateValue.startDate);
        cy.findByLabelText("End date")
          .clear()
          .type(initialRangeDateValue.endDate);
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.callCount", 4);
        // Simulate receiving focus but the date range not changing
        cy.findByLabelText("Start date").focus();
        cy.realPress("Tab");
        cy.findByLabelText("Start date").should(
          "have.value",
          initialRangeDateValue.startDate,
        );
        cy.findByLabelText("End date").should("have.focus");
        cy.realPress("Tab");
        cy.findByLabelText("End date").should(
          "have.value",
          initialRangeDateValue.endDate,
        );
        // Verify there is no change event
        cy.get("@selectionChangeSpy").should("have.callCount", 4);
      });

      it("SHOULD support clearing dates", () => {
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
        cy.findByLabelText("End date")
          .click()
          .clear()
          .type(initialRangeDateValue.endDate);
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should("have.callCount", 2);
        // Verify there is a valid change event
        cy.findByLabelText("Start date").should(
          "have.value",
          initialRangeDateValue.startDate,
        );
        cy.findByLabelText("End date").should(
          "have.value",
          initialRangeDateValue.endDate,
        );

        // Clear start date
        cy.findByLabelText("Start date").clear();
        cy.realPress("Tab");
        // biome-ignore lint/suspicious/noExplicitAny: spy
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(date.startDate).to.be.null;
          expect(adapter.isValid(date.endDate)).to.be.true;
          expect(adapter.format(date.endDate, "DD MMM YYYY")).to.equal(
            initialRangeDateValue.endDate,
          );
          expect(details).to.deep.equal({
            startDate: {
              value: "",
              errors: [
                {
                  type: DateDetailError.UNSET,
                  message: "no start date defined",
                },
              ],
            },
            endDate: { value: initialRangeDateValue.endDate },
          });
        });
        cy.findByLabelText("Start date").should("have.value", "");
        // Clear end date
        cy.findByLabelText("End date").clear();
        cy.realPress("Tab");
        cy.get("@selectionChangeSpy").should((spy: any) => {
          const [_event, date, details] = spy.lastCall.args;
          expect(date.startDate).to.be.null;
          expect(date.endDate).to.be.null;
          expect(details).to.deep.equal({
            startDate: {
              value: "",
              errors: [
                {
                  type: DateDetailError.UNSET,
                  message: "no start date defined",
                },
              ],
            },
            endDate: {
              value: "",
              errors: [
                {
                  type: DateDetailError.UNSET,
                  message: "no end date defined",
                },
              ],
            },
          });
        });
        cy.findByLabelText("End date").should("have.value", "");
      });

      it("SHOULD render helper text in the panel when opened ", () => {
        cy.mount(<RangeWithFormField />);
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
        cy.findAllByRole("application").should("have.length", 2);
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
          // biome-ignore lint/suspicious/noExplicitAny: spy
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
          // biome-ignore lint/suspicious/noExplicitAny: spy
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
          // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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

      describe("timezone", () => {
        [
          {
            timezone: "default",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "system",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "UTC",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "America/New_York",
            expectedResult: {
              startDate: "2025-01-05T05:00:00.000Z",
              endDate: "2025-01-06T05:00:00.000Z",
            },
          },
          {
            timezone: "Europe/London",
            expectedResult: {
              startDate: "2025-01-05T00:00:00.000Z",
              endDate: "2025-01-06T00:00:00.000Z",
            },
          },
          {
            timezone: "Asia/Shanghai",
            expectedResult: {
              startDate: "2025-01-04T16:00:00.000Z",
              endDate: "2025-01-05T16:00:00.000Z",
            },
          },
          {
            timezone: "Asia/Kolkata",
            expectedResult: {
              startDate: "2025-01-04T18:30:00.000Z",
              endDate: "2025-01-05T18:30:00.000Z",
            },
          },
        ].forEach(({ timezone, expectedResult }) => {
          if (adapter.lib === "date-fns" && timezone !== "default") {
            return;
          }
          it(`SHOULD render date in the ${timezone} timezone`, () => {
            cy.mount(<RangeWithTimezone />);
            // Simulate selecting timezone
            cy.findByLabelText("timezone dropdown").realClick();
            cy.findByRole("option", { name: timezone }).realHover().realClick();
            // Simulate selection of date range
            cy.findByLabelText("Start date")
              .click()
              .clear()
              .type(initialRangeDateValue.startDate);
            cy.realPress("Tab");
            cy.findByLabelText("End date")
              .click()
              .clear()
              .type(initialRangeDateValue.endDate);
            cy.realPress("Tab");
            // Verify the ISO date range
            cy.findByTestId("iso-start-date-label").should(
              "have.text",
              expectedResult.startDate,
            );
            cy.findByTestId("iso-end-date-label").should(
              "have.text",
              expectedResult.endDate,
            );
          });
        });
      });

      describe("uncontrolled component", () => {
        it("SHOULD render the default date", () => {
          cy.mount(<Range defaultSelectedDate={initialRangeDate} />);
          // Verify that the selected dates are displayed
          cy.findByLabelText("Start date").should("have.value", "05 Jan 2025");
          cy.findByLabelText("End date").should("have.value", "06 Jan 2025");
          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" })
            .realClick()
            .type("{downArrow}", { force: true });
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          //Verify the start date is focused
          cy.findByRole("button", {
            name: adapter.format(initialRangeDate.startDate, "DD MMMM YYYY"),
          }).should("be.focused");
          // Verify that the default selected dates are highlighted in the calendar
          cy.findByRole("button", {
            name: "05 January 2025",
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: "06 January 2025",
          }).should("have.attr", "aria-pressed", "true");
        });

        it("SHOULD not be able to select un-selectable dates", () => {
          cy.mount(
            <RangeWithUnselectableDates
              defaultSelectedDate={initialRangeDate}
            />,
          );

          const startDate = adapter.parse("01 Jan 2025", "DD MMM YYYY").date;
          const endDate = adapter.parse("31 Jan 2025", "DD MMM YYYY").date;
          let currentDate = adapter.clone(startDate);

          // Simulate opening the calendar
          cy.findByRole("button", { name: "Open Calendar" }).realClick();
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);

          while (currentDate <= endDate) {
            const formattedDate = adapter.format(currentDate, "DD MMMM YYYY");
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
          cy.findByRole("button", { name: "Open Calendar" })
            .realClick()
            .type("{downArrow}", { force: true });
          // Verify that the calendar is displayed
          cy.findAllByRole("application").should("have.length", 2);
          //Verify the start date is focused
          cy.findByRole("button", {
            name: adapter.format(initialRangeDate.startDate, "DD MMMM YYYY"),
          }).should("be.focused");
          // Verify that the selected dates are highlighted in the calendar
          cy.findByRole("button", {
            name: "05 January 2025",
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: "06 January 2025",
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: "01 January 2025",
          }).realClick();
          cy.findByRole("button", {
            name: "02 January 2025",
          }).realClick();

          // Reset/set programatically
          cy.findByLabelText("set start date to today").realClick();
          cy.findByLabelText("Start date").should(
            "have.value",
            adapter.format(adapter.today(), "DD MMMM YYYY"),
          );
          cy.findByLabelText("set end date to today").realClick();
          const tomorrow = adapter.add(adapter.today(), { days: 1 });
          cy.findByLabelText("End date").should(
            "have.value",
            adapter.format(tomorrow, "DD MMMM YYYY"),
          );
          cy.findByLabelText("reset start date").realClick();
          cy.findByLabelText("Start date").should("have.value", "");
          cy.findByLabelText("reset end date").realClick();
          cy.findByLabelText("End date").should("have.value", "");
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
        // biome-ignore lint/suspicious/noExplicitAny: spy
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

      it("SHOULD support format prop on the input", () => {
        const format = "YYYY-MM-DD";

        cy.mount(
          <RangeCustomFormat
            format={format}
            defaultSelectedDate={initialRangeDate}
          />,
        );
        // Verify that the selected dates are displayed
        cy.findByLabelText("Start date").should("have.value", "2025-01-05");
        cy.findByLabelText("End date").should("have.value", "2025-01-06");
      });
    });
  });
});
