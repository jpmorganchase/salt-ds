import { composeStories } from "@storybook/react";
import { ChangeEvent } from "react";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
const composedStories = composeStories(dateInputStories);
const { Default } = composedStories;

describe("GIVEN a DateInput", () => {
  checkAccessibility(composedStories);

  describe("WHEN mounted the component", () => {
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
  });
});
