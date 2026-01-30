import { Kbd } from "@salt-ds/lab";
import * as kbdStories from "@stories/kbd/kbd.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(kbdStories);
const { Default, Variants, InlineWithText, NestedInInput } = composedStories;

describe("Given a Kbd", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Cmd").should("be.visible");
    cy.findByText("Shift").should("be.visible");
  });

  it("renders as a semantic <kbd> element", () => {
    cy.mount(<Kbd>Key</Kbd>);
    cy.get("kbd").should("exist");
  });

  it("passes additional props to the kbd element", () => {
    cy.mount(
      <Kbd id="my-kbd" data-test="kbd-test">
        A
      </Kbd>,
    );
    cy.get("#my-kbd").should("exist").and("have.attr", "data-test", "kbd-test");
  });
});
