import { Button } from "@salt-ds/core";
import { InsertionPointProvider } from "@salt-ds/styles";

describe("Given an insertion point", () => {
  // insert a marker in the head that the InsertionPointProvider will use
  before(() => {
    cy.get("html").then(() => {
      const styleMarker = document.createElement("meta");
      styleMarker.dataset.marker = "example";
      document.head.append(styleMarker);
    });
  });
  it("SHOULD then inject the styles at the provided point ", () => {
    cy.mount(
      <InsertionPointProvider
        insertionPoint={document.querySelector('[data-marker="example"]')}
      >
        <Button>Test</Button>
      </InsertionPointProvider>
    );

    cy.get('[data-salt-style="salt-button"]').then((injectedStyle) => {
      cy.get('[data-marker="example"]').then((marker) => {
        // Is the style before the marker
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(marker[0]) &
            Node.DOCUMENT_POSITION_PRECEDING
        ).should("equal", 0);
      });
      cy.get("style").then((styles) => {
        // Is the style after the first child within the head
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(styles[0]) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).should("equal", 0);
      });
    });
  });
});
