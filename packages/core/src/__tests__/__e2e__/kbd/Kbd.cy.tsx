import { Kbd } from "@salt-ds/core";
import * as kbdStories from "@stories/kbd/kbd.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(kbdStories);

describe("Given a Kbd", () => {
  checkAccessibility(composedStories);

  it("renders as a semantic <kbd> element", () => {
    cy.mount(
      <Kbd id="my-kbd" data-test="kbd-test">
        Key
      </Kbd>,
    );
    cy.get("kbd").should("exist");
    cy.get("#my-kbd").should("exist").and("have.attr", "data-test", "kbd-test");
  });
});
