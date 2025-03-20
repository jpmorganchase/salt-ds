import * as buttonStories from "@stories/splitter/splitter.stories";
import { composeStories } from "@storybook/react";

const composedStories = composeStories(buttonStories);

const { CollapsibleTo0, ProgrammableResize } = composedStories;

describe("<Splitter />", () => {
  it("should collapse on double click", () => {
    cy.mount(<CollapsibleTo0 />);

    cy.findByRole("separator")
      .prev()
      .should("have.attr", "data-panel-size", "30.0");

    cy.findByRole("separator").dblclick();

    cy.findByRole("separator")
      .prev()
      .should("have.attr", "data-panel-size", "0.0");

    cy.findByRole("separator").dblclick();

    cy.findByRole("separator")
      .prev()
      .should("have.attr", "data-panel-size", "30.0");
  });

  it("should resize when triggered from outside", () => {
    cy.mount(<ProgrammableResize />);

    cy.findByText("10 | 90").click();

    cy.findByRole("separator")
      .prev()
      .should("have.attr", "data-panel-size", "10.0");

    cy.findByRole("separator")
      .next()
      .should("have.attr", "data-panel-size", "90.0");

    cy.findByText("50 | 50").click();

    cy.findByRole("separator")
      .prev()
      .should("have.attr", "data-panel-size", "50.0");

    cy.findByRole("separator")
      .next()
      .should("have.attr", "data-panel-size", "50.0");

    cy.findByText("90 | 10").click();

    cy.findByRole("separator")
      .prev()
      .should("have.attr", "data-panel-size", "90.0");

    cy.findByRole("separator")
      .next()
      .should("have.attr", "data-panel-size", "10.0");
  });
});
