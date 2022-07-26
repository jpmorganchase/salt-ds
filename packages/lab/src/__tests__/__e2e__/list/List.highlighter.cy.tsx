import { Highlighter } from "../../../list/Highlighter";

describe("A highlighter", () => {
  it("should handle empty text", () => {
    cy.mount(
      <span data-testid="test-string">
        <Highlighter text="" />
      </span>
    );
    cy.findByTestId("test-string").should("have.text", "");
  });

  it("should not highlight anything with an invalid match regex", () => {
    cy.mount(
      <span data-testid="test-string">
        <Highlighter text="Lorem ipsum dolor sit amet" />
      </span>
    );

    cy.findByText("Lorem ipsum dolor sit amet").should("exist");
  });

  describe("when using a string match", () => {
    it("should not highlight anything if there is no match", () => {
      cy.mount(
        <span>
          <Highlighter
            matchPattern="not found"
            text="Lorem ipsum dolor sit amet"
          />
        </span>
      );

      cy.findByText("Lorem ipsum dolor sit amet").should("exist");
    });

    it("should highlight matched text with correct style", () => {
      cy.mount(
        <span data-testid="test-string">
          <Highlighter matchPattern="OR" text="Lorem ipsum dolor sit amet" />
        </span>
      );

      cy.get(`.uitkHighlighter-highlight`).should("have.length", 2);
      // And full text is returned
      cy.findByTestId("test-string").should(
        "have.text",
        "Lorem ipsum dolor sit amet"
      );
    });

    describe("when using a regex match", () => {
      it("should not highlight anything if there is no match", () => {
        cy.mount(
          <span>
            <Highlighter
              matchPattern={/(not found)/gi}
              text="Lorem ipsum dolor sit amet"
            />
          </span>
        );
        cy.findByText("Lorem ipsum dolor sit amet").should("exist");
      });

      it("should highlight matched text with correct style", () => {
        cy.mount(
          <span data-testid="test-string">
            <Highlighter
              matchPattern={/(\w{1,2}m)/gi}
              text="Lorem ipsum dolor sit amet"
            />
          </span>
        );

        cy.findByText("rem").should("have.class", "uitkHighlighter-highlight");
        cy.findByText("sum").should("have.class", "uitkHighlighter-highlight");
        cy.findByText("am").should("have.class", "uitkHighlighter-highlight");

        // And full text is returned
        cy.findByTestId("test-string").should(
          "have.text",
          "Lorem ipsum dolor sit amet"
        );
      });
    });
  });
});
