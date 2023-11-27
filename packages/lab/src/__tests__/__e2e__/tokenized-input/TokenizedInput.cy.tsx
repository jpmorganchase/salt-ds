import { composeStories } from "@storybook/react";
import * as tokenizedInputStories from "@stories/tokenized-input/tokenized-input.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { statesData } from "@stories/assets/exampleData";

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
    // Clear button should exist
    cy.findByRole("option").should("exist");

    // Remove the item
    cy.realPress("ArrowLeft");
    cy.realPress("Backspace");

    // clear button should not exist after removal
    cy.findByRole("option").should("not.exist");
  });

  it("should clear input on clicking the clear button", () => {
    cy.mount(<Default initialSelectedItems={["Tokyo"]} />);
    cy.findByRole("textbox").focus();
    cy.findByTestId("clear-button").click();
    cy.findByRole("textbox").should("have.value", "");
  });
  it("should expand on clicking the expand button and collapse when blur", () => {
    cy.mount(<Default initialSelectedItems={statesData} />);
    cy.findByRole("textbox").focus();
    cy.get('[data-testid="pill"]').should("have.length", 50);
    cy.get('[data-testid="pill"]').eq(49).should("be.visible");
    // Move focus out of Tokenized input
    cy.realPress("Tab");
    cy.realPress("Tab");

    cy.findByRole("textbox").should("not.be.focused");
    cy.get('[data-testid="pill"]').should("have.length", 50);
    cy.findAllByTestId("pill").eq(49).should("not.be.visible");
  });
  it("should not display the clear button if there is no selection", () => {
    cy.mount(<Default />);
    cy.findByTestId("clear-button").should("not.exist");
  });
  it("should return focus to input if an item is closed", () => {
    cy.mount(<Default initialSelectedItems={["Tokyo"]} />);
    cy.findByRole("textbox").focus();
    // move focus to clear button
    cy.findByTestId("clear-button").focus();
    cy.findByTestId("clear-button").realPress("Enter");
    cy.findByRole("textbox").should("have.focus");
  });
});
