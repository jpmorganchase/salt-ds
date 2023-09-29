import { composeStories } from "@storybook/react";
import * as tabstripStories from "@stories/tabstrip/tabstrip.cypress.stories";

const { SimpleTabstrip } = composeStories(tabstripStories);

const OVERFLOWED_ITEMS = '.saltTabstrip-inner > *[data-overflowed="true"]';
const OVERFLOW_IND = '.saltTabstrip-inner > *[data-overflow-indicator="true"]';
const ADD_BUTTON = '.saltTabstrip-inner  > *[aria-label="Create Tab"]';

describe("Given a Tabstrip", () => {
  describe("WHEN no id is specified", () => {
    it("THEN Tabstrip will be rendered with a generated id", () => {
      cy.mount(<SimpleTabstrip />);
      cy.get(".saltTabstrip").should("have.attr", "id");
    });
    it("THEN id of each Tab will extend same id", () => {
      cy.mount(<SimpleTabstrip />);
      cy.get(".saltTabstrip").then(([el]) => {
        [0, 1, 2, 3, 4].forEach((i) => {
          cy.get(".saltTab").eq(i).should("have.attr", "id", `${el.id}-${i}`);
        });
      });
    });
  });

  describe("WHEN passed an id", () => {
    it("THEN Tabstrip will be rendered with same id", () => {
      cy.mount(<SimpleTabstrip id="test" />);
      cy.get(".saltTabstrip").should("have.attr", "id", "test");
    });
    it("THEN id of each Tab will extend same id", () => {
      cy.mount(<SimpleTabstrip id="test" />);
      [0, 1, 2, 3, 4].forEach((i) => {
        cy.get(".saltTab").eq(i).should("have.attr", "id", `test-${i}`);
      });
    });
  });
});
