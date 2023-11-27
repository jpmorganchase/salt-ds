import { composeStories } from "@storybook/react";
import * as tokenizedInputStories from "@stories/tokenized-input/tokenized-input.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tokenizedInputStories);

const { Default } = composedStories;

describe("Given a Tokenized Input", () => {
  checkAccessibility(composedStories);

  it("should render the Tokenized Input with pre selected items", () => {
    cy.mount(<Default initialSelectedItems={["Tokyo"]} />);
    cy.findByRole("textbox").should("exist");
    cy.findByRole("option").should("exist");
  });
  it("should allow adding items by typing and pressing the delimiter", () => {
    cy.mount(<Default />);
    cy.findByRole("textbox").type("Tokio,");
    cy.findByRole("option").should("exist");
  });
  it("should allow adding items by typing and pressing enter", () => {
    cy.mount(<Default />);
    cy.findByRole("textbox").type("Tokio{enter}");
    cy.findByRole("option").should("exist");
  });
  it("should allow removing items by clicking on the close button", () => {
    cy.mount(<Default initialSelectedItems={["Tokyo"]} />);
    cy.findByRole("textbox").should("exist");
    cy.findByRole("textbox").focus();
    // clear buton should exist
    cy.findByRole("option").should("exist");
    cy.realPress("ArrowLeft");
    cy.realPress("Backspace");
    cy.findByRole("option").should("not.exist");
  });
  it("should expand on clicking the expand button", () => {
    // TODO:  this is not working on first load
    cy.mount(<Default initialSelectedItems={["Tokyo"]} />);
  });
  it("should clear input on clicking the clear button", () => {
    cy.mount(<Default />);
  });
  it("should collapse when blur", () => {
    cy.mount(<Default />);
  });
  it("should not display the clear button if there is no selection", () => {
    cy.mount(<Default />);
  });
  it("should return focus to input if an item is closed", () => {
    cy.mount(<Default />);
  });
});
