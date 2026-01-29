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

  it("should apply the correct variant classes", () => {
    cy.mount(<Variants />);
    cy.findByText("primary")
      .should("have.class", "saltKbd")
      .and("have.class", "saltKbd-primary");
    cy.findByText("secondary")
      .should("have.class", "saltKbd")
      .and("have.class", "saltKbd-secondary");
    cy.findByText("tertiary")
      .should("have.class", "saltKbd")
      .and("have.class", "saltKbd-tertiary");
  });

  it("applies custom className", () => {
    cy.mount(<Kbd className="my-custom-class">Key</Kbd>);
    cy.get("kbd.my-custom-class").should("exist");
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

  it("renders inline with text", () => {
    cy.mount(<InlineWithText />);
    cy.contains("Hit").should("be.visible");
    cy.findByText("Ctrl").should("be.visible");
    cy.findByText("k").should("be.visible");
  });

  it("renders inside input adornment", () => {
    cy.mount(<NestedInInput />);
    cy.get("input").should("exist");
    cy.findByText("Cmd").should("be.visible");
    cy.findByText("K").should("be.visible");
  });
});
