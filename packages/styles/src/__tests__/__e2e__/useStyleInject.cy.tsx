import { useState } from "react";
import { Button } from "@salt-ds/core";
import { InsertionPointProvider } from "@salt-ds/styles";

import TestComponent from "./TestComponent";

const testComponentCss1 = `
  .TestComponent1 {
    background-color: red;
  }
`;

const testComponentCss2 = `
  .TestComponent2 {
    background-color: blue;
  }
`;

const RemovableTest = () => {
  const [isVisible, setIsVisibile] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          setIsVisibile((old) => !old);
        }}
      >
        Toggle Test Component
      </Button>
      {isVisible && (
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
      )}
    </div>
  );
};

describe("Given two components with the same injection ID but different css", () => {
  it("SHOULD inject both sets of css", () => {
    cy.mount(
      <div>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
        <TestComponent
          className="TestComponent2"
          injectionId="test-component"
          injectionCss={testComponentCss2}
        />
      </div>
    );

    cy.get('[data-salt-style="test-component"]').then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 2);
      cy.wrap(injectedStyles[0].innerHTML).should(
        "not.equal",
        injectedStyles[1].innerHTML
      );
      cy.wrap(injectedStyles[0].innerHTML).should("be.oneOf", [
        testComponentCss1,
        testComponentCss2,
      ]);
      cy.wrap(injectedStyles[1].innerHTML).should("be.oneOf", [
        testComponentCss1,
        testComponentCss2,
      ]);
    });
  });
});

describe("Given two components with no insertion ID but different css", () => {
  it("SHOULD inject both sets of css", () => {
    cy.mount(
      <div>
        <TestComponent
          className="TestComponent1"
          injectionCss={testComponentCss1}
        />
        <TestComponent
          className="TestComponent2"
          injectionCss={testComponentCss2}
        />
      </div>
    );

    cy.get('[data-salt-style=""]').then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 2);
      cy.wrap(injectedStyles[0].innerHTML).should(
        "not.equal",
        injectedStyles[1].innerHTML
      );
      cy.wrap(injectedStyles[0].innerHTML).should("be.oneOf", [
        testComponentCss1,
        testComponentCss2,
      ]);
      cy.wrap(injectedStyles[1].innerHTML).should("be.oneOf", [
        testComponentCss1,
        testComponentCss2,
      ]);
    });
  });
});

describe("Given a removed component which has injected css", () => {
  it("SHOULD remove the injected style elements", () => {
    cy.mount(
      <div>
        <RemovableTest />
      </div>
    );

    const SELECTOR = '[data-salt-style="test-component"]';

    cy.get(SELECTOR).should("not.exist");

    cy.findByRole("button").realClick();

    cy.get(SELECTOR).then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 1);
    });

    cy.findByRole("button").realClick();

    cy.get(SELECTOR).should("not.exist");
  });
});

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
