import * as tabstripStories from "@stories/tabstrip/tabstrip.cypress.stories";
import { composeStories } from "@storybook/react-vite";

const { SimpleTabstrip } = composeStories(tabstripStories);

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
