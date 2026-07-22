import { Button } from "@salt-ds/core";
import {
  InsertionPointProvider,
  StyleInjectionProvider,
} from "@salt-ds/styles";
import { useState } from "react";

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

const SameCssRefCountTest = () => {
  const [isFirstVisible, setIsFirstVisible] = useState(true);
  const [isSecondVisible, setIsSecondVisible] = useState(true);

  return (
    <div>
      <Button onClick={() => setIsFirstVisible(false)}>Remove first</Button>
      <Button onClick={() => setIsSecondVisible(false)}>Remove second</Button>
      {isFirstVisible && (
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        >
          First
        </TestComponent>
      )}
      {isSecondVisible && (
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        >
          Second
        </TestComponent>
      )}
    </div>
  );
};

const StyleInjectionToggleTest = () => {
  const [isStyleInjectionEnabled, setIsStyleInjectionEnabled] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsStyleInjectionEnabled((old) => !old)}>
        Toggle style injection
      </Button>
      <StyleInjectionProvider value={isStyleInjectionEnabled}>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
      </StyleInjectionProvider>
    </div>
  );
};

const InsertionPointToggleTest = () => {
  const [useSecondMarker, setUseSecondMarker] = useState(false);
  const insertionPoint = document.querySelector(
    useSecondMarker
      ? '[data-marker="dynamic-example-two"]'
      : '[data-marker="dynamic-example-one"]',
  );

  return (
    <div>
      <Button onClick={() => setUseSecondMarker(true)}>
        Move insertion point
      </Button>
      <InsertionPointProvider insertionPoint={insertionPoint}>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
      </InsertionPointProvider>
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
      </div>,
    );

    cy.get('[data-salt-style="test-component"]').then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 2);
      cy.wrap(injectedStyles[0].innerHTML).should(
        "not.equal",
        injectedStyles[1].innerHTML,
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
      </div>,
    );

    cy.get('[data-salt-style=""]').then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 2);
      cy.wrap(injectedStyles[0].innerHTML).should(
        "not.equal",
        injectedStyles[1].innerHTML,
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

describe("Given two components with the same css", () => {
  it("SHOULD share one style element until all component instances are removed", () => {
    const SELECTOR = '[data-salt-style="test-component"]';

    cy.mount(<SameCssRefCountTest />);

    cy.get(SELECTOR).then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 1);
      cy.wrap(injectedStyles[0].innerHTML).should("equal", testComponentCss1);
    });

    cy.findByRole("button", { name: "Remove first" }).realClick();

    cy.get(SELECTOR).then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 1);
      cy.wrap(injectedStyles[0].innerHTML).should("equal", testComponentCss1);
    });

    cy.findByRole("button", { name: "Remove second" }).realClick();

    cy.get(SELECTOR).should("not.exist");
  });
});

describe("Given style injection is toggled", () => {
  it("SHOULD inject and remove styles when the provider value changes", () => {
    const SELECTOR = '[data-salt-style="test-component"]';

    cy.mount(<StyleInjectionToggleTest />);

    cy.get(SELECTOR).should("not.exist");

    cy.findByRole("button", { name: "Toggle style injection" }).realClick();

    cy.get(SELECTOR).then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 1);
      cy.wrap(injectedStyles[0].innerHTML).should("equal", testComponentCss1);
    });

    cy.findByRole("button", { name: "Toggle style injection" }).realClick();

    cy.get(SELECTOR).should("not.exist");
  });
});

describe("Given a removed component which has injected css", () => {
  it("SHOULD remove the injected style elements", () => {
    cy.mount(
      <div>
        <RemovableTest />
      </div>,
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

describe("Given an injected style element is removed outside React", () => {
  it("SHOULD clean up without error and allow the style to be injected again", () => {
    cy.mount(
      <div>
        <RemovableTest />
      </div>,
    );

    const SELECTOR = '[data-salt-style="test-component"]';

    cy.findByRole("button").realClick();

    cy.get(SELECTOR).then((injectedStyles) => {
      injectedStyles[0].remove();
    });
    cy.get(SELECTOR).should("not.exist");

    cy.findByRole("button").realClick();

    cy.get(SELECTOR).should("not.exist");

    cy.findByRole("button").realClick();

    cy.get(SELECTOR).then((injectedStyles) => {
      cy.wrap(injectedStyles.length).should("equal", 1);
      cy.wrap(injectedStyles[0].innerHTML).should("equal", testComponentCss1);
    });
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
      </InsertionPointProvider>,
    );

    cy.get('[data-salt-style="salt-button"]').then((injectedStyle) => {
      cy.get('[data-marker="example"]').then((marker) => {
        // Is the style before the marker
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(marker[0]) &
            Node.DOCUMENT_POSITION_PRECEDING,
        ).should("equal", 0);
      });
      cy.get("style").then((styles) => {
        // Is the style after the first child within the head
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(styles[0]) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).should("equal", 0);
      });
    });
  });
});

describe("Given the insertion point changes", () => {
  before(() => {
    cy.get("html").then(() => {
      document
        .querySelectorAll('[data-marker^="dynamic-example"]')
        .forEach((marker) => {
          marker.remove();
        });

      const firstStyleMarker = document.createElement("meta");
      firstStyleMarker.dataset.marker = "dynamic-example-one";
      document.head.append(firstStyleMarker);

      const secondStyleMarker = document.createElement("meta");
      secondStyleMarker.dataset.marker = "dynamic-example-two";
      document.head.append(secondStyleMarker);
    });
  });

  it("SHOULD move the injected styles to the updated insertion point", () => {
    cy.mount(<InsertionPointToggleTest />);

    cy.get('[data-salt-style="test-component"]').then((injectedStyle) => {
      cy.get('[data-marker="dynamic-example-one"]').then((marker) => {
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(marker[0]) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).should("equal", Node.DOCUMENT_POSITION_FOLLOWING);
      });
    });

    cy.findByRole("button", { name: "Move insertion point" }).realClick();

    cy.get('[data-salt-style="test-component"]').then((injectedStyle) => {
      cy.get('[data-marker="dynamic-example-one"]').then((marker) => {
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(marker[0]) &
            Node.DOCUMENT_POSITION_PRECEDING,
        ).should("equal", Node.DOCUMENT_POSITION_PRECEDING);
      });
      cy.get('[data-marker="dynamic-example-two"]').then((marker) => {
        cy.wrap(
          injectedStyle[0].compareDocumentPosition(marker[0]) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).should("equal", Node.DOCUMENT_POSITION_FOLLOWING);
      });
    });
  });
});
