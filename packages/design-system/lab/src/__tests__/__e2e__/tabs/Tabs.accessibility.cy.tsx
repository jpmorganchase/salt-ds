import { composeStories } from "@storybook/testing-react";
import * as tabstripStories from "@stories/tabs/tabstrip.cypress.stories";

const { SimpleTabstrip } = composeStories(tabstripStories);

const OVERFLOWED_ITEMS = '.uitkTabstrip-inner > *[data-overflowed="true"]';
const OVERFLOW_IND = '.uitkTabstrip-inner > *[data-overflow-indicator="true"]';
const ADD_BUTTON = '.uitkTabstrip-inner  > *[aria-label="Create Tab"]';

describe("Given a Tabstrip", () => {
  describe("WHEN no id is specified", () => {
    it("THEN Tabstrip will be rendered with a generated id", () => {
      cy.mount(<SimpleTabstrip />);
      cy.get(".uitkTabstrip").should("have.attr", "id");
    });
    it("THEN id of each Tab will extend same id", () => {
      cy.mount(<SimpleTabstrip />);
      cy.get(".uitkTabstrip").then(([el]) => {
        [0, 1, 2, 3, 4].forEach((i) => {
          cy.get(".uitkTab").eq(i).should("have.attr", "id", `${el.id}-${i}`);
        });
      });
    });
  });

  describe("WHEN passed an id", () => {
    it("THEN Tabstrip will be rendered with same id", () => {
      cy.mount(<SimpleTabstrip id="test" />);
      cy.get(".uitkTabstrip").should("have.attr", "id", "test");
    });
    it("THEN id of each Tab will extend same id", () => {
      cy.mount(<SimpleTabstrip id="test" />);
      [0, 1, 2, 3, 4].forEach((i) => {
        cy.get(".uitkTab").eq(i).should("have.attr", "id", `test-${i}`);
      });
    });
  });
});
