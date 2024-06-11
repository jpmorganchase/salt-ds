import { composeStories } from "@storybook/react";
import { ChangeEvent } from "react";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
const composedStories = composeStories(dateInputStories);
const { Default, Range } = composedStories;
const testStartInputDate = "02-feb-2000";
const testEndInputDate = "02-mar-2000";
describe("GIVEN a DateInput", () => {
  checkAccessibility(composedStories);

  describe("WHEN mounted the component", () => {
    it("Should have accessible text in inputs", () => {
      cy.mount(<Range />);
      cy.findAllByRole("textbox")
        .eq(0)
        .should("have.accessibleName", "Start date");
      cy.findAllByRole("textbox")
        .eq(1)
        .should("have.accessibleName", "End date");
    });
    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };
        cy.mount(<Default onChange={onChange} />);
        cy.findByRole("textbox").click().clear().type("02-feb-2000");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "02-feb-2000" },
        });
      });
    });
    describe("WHEN the range input is updated", () => {
      it("THEN should call onChange with the new values", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const onChange = (
          event: ChangeEvent<HTMLInputElement>,
          startDateInputValue?: string,
          endDateInputValue?: string
        ) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(startDateInputValue, endDateInputValue);
        };

        cy.mount(<Range onChange={onChange} />);
        cy.findAllByRole("textbox")
          .eq(0)
          .click()
          .clear()
          .type(testStartInputDate);
        cy.findAllByRole("textbox")
          .eq(1)
          .click()
          .clear()
          .type(testEndInputDate);
        cy.get("@changeSpy").should(
          "have.been.calledWith",
          testStartInputDate,
          testEndInputDate
        );
      });
    });
  });
});
