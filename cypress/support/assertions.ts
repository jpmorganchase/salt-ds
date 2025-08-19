import AssertionStatic = Chai.AssertionStatic;
import ChaiPlugin = Chai.ChaiPlugin;

import { prettyDOM } from "@testing-library/dom";
import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "dom-accessibility-api";

function elementToString(element: Element | null | undefined) {
  if (typeof element?.nodeType === "number") {
    return prettyDOM(element, undefined, { highlight: true, maxDepth: 1 });
  }
  return String(element);
}

function checkMessage(message: string, matcher: string | RegExp) {
  if (!message) {
    return false;
  }

  if (typeof matcher === "string") {
    return message === matcher;
  }

  return matcher.exec(message);
}

// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    interface Chainer<Subject> {
      /**
       * Checks if the accessible name computation (according to `accname` spec)
       * matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('have.accessibleName','Close')
       ```
       * */
      (chainer: "have.accessibleName"): Chainable<Subject>;
      /**
       * Checks if the accessible name computation (according to `accname` spec)
       * does NOT match the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('not.have.accessibleName','Close')
       ```
       * */
      (chainer: "not.have.accessibleName"): Chainable<Subject>;
      /**
       * Checks if the accessible name computation (according to `accname` spec)
       * matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('have.accessibleDescription','Close')
       ```
       * */
      (chainer: "have.accessibleDescription"): Chainable<Subject>;
      /**
       * Checks if the accessible name computation (according to `accname` spec)
       * does NOT match the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('not.have.accessibleDescription','Close')
       ```
       * */
      (chainer: "not.have.accessibleDescription"): Chainable<Subject>;
      /**
       * Checks if the announcement is matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).click().should('announce','Close')
       ```
       * */
      (chainer: "announce"): Chainable<Subject>;
      /**
       * Checks if the approriate saltHighlighted className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('be.highlighted')
       ```
       * */
      (chainer: "be.highlighted"): Chainable<Subject>;
      /**
       * Checks if the approriate saltHighlighted className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('be.highlighted')
       ```
       * */
      (chainer: "not.be.highlighted"): Chainable<Subject>;
      /**
       * Checks that the aria-selected attribute has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('have.ariaSelected')
       ```
       * */
      (chainer: "have.ariaSelected"): Chainable<Subject>;
      /**
       * Checks that the aria-selected attribute is not present.
       *
       * @example
       ```
       cy.findByRole('option).should('not.have.ariaSelected')
       ```
       * */
      (chainer: "not.have.ariaSelected"): Chainable<Subject>;
      /**
       * Checks if the approriate saltFocusVisible className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('have.focusVisible')
       ```
       * */
      (chainer: "be.focusVisible"): Chainable<Subject>;
      (chainer: "have.focusVisible"): Chainable<Subject>;
      /**
       * Checks if the approriate saltFocusVisible className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('not.have.focusVisible')
       ```
       * */
      (chainer: "not.be.focusVisible"): Chainable<Subject>;
      (chainer: "not.have.focusVisible"): Chainable<Subject>;
      /**
       * Checks if the element is in the viewport.
       *
       * @example
       ```
       cy.findByRole('option).should('be.inTheViewport')
       ```
       * */
      (chainer: "be.inTheViewport"): Chainable<Subject>;
      /**
       * Checks if the element is not in the viewport.
       *
       * @example
       ```
       cy.findByRole('option).should('not.be.inTheViewport')
       ```
       * */
      (chainer: "not.be.inTheViewport"): Chainable<Subject>;
      /**
       * Checks if the element is the active descendant.
       *
       * @example
       ```
       cy.findByRole('option).should('be.activeDescendant')
       ```
       * */
      (chainer: "be.activeDescendant"): Chainable<Subject>;
      /**
       * Checks if the element is not the active descendant.
       *
       * @example
       ```
       cy.findByRole('option).should('not.be.activeDescendant')
       ```
       * */
      (chainer: "not.be.activeDescendant"): Chainable<Subject>;
    }
  }
}

/**
 * Checks if the accessible name computation (according to `accname` spec)
 * matches the expectation.
 *
 * @example
 * cy.findByRole('button).should('have.accessibleName','Close')
 */
const hasAccessibleName: ChaiPlugin = (_chai) => {
  function assertHasAccessibleName(
    this: AssertionStatic,
    expectedName: string,
  ) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const actualName = computeAccessibleName(root, {
      computedStyleSupportsPseudoElements: true,
    });

    this.assert(
      actualName === expectedName,
      `expected \n${elementToString(
        root,
      )} to have accessible name #{exp} but got #{act} instead.`,
      `expected \n${elementToString(root)} not to have accessible name #{exp}.`,
      expectedName,
      actualName,
    );
  }

  _chai.Assertion.addMethod("accessibleName", assertHasAccessibleName);
};

chai.use(hasAccessibleName);

/**
 * Checks if the accessible description computation (according to `accdescription` spec)
 * matches the expectation.
 *
 * @example
 * cy.findByRole('button).should('have.accessibleDescription','Close')
 */
const hasAccessibleDescription: ChaiPlugin = (_chai) => {
  function assertHasAccessibleDescription(
    this: AssertionStatic,
    expectedDescription: string,
  ) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const actualDescription = computeAccessibleDescription(root, {
      computedStyleSupportsPseudoElements: true,
    });

    this.assert(
      actualDescription === expectedDescription,
      `expected \n${elementToString(
        root,
      )} to have accessible description #{exp} but got #{act} instead.`,
      `expected \n${elementToString(
        root,
      )} not to have accessible description #{exp}.`,
      expectedDescription,
      actualDescription,
    );
  }

  _chai.Assertion.addMethod(
    "accessibleDescription",
    assertHasAccessibleDescription,
  );
};

chai.use(hasAccessibleDescription);

const announces: ChaiPlugin = (_chai, utils) => {
  function assertAnnounces(
    this: AssertionStatic,
    msgMatcher?: string | RegExp,
  ) {
    // @ts-expect-error
    const announcement = cy.state("announcement") as string | null;

    // Checking if error was thrown
    if (msgMatcher === undefined) {
      this.assert(
        announcement !== null,
        "expected to announce message",
        "expected to not announce message but #{act} was announced",
        announcement,
      );
    }

    if (announcement && msgMatcher != null) {
      // Here we check compatible messages
      let placeholder = "including";
      if (msgMatcher instanceof RegExp) {
        placeholder = "matching";
      }

      const isCompatibleMessage = checkMessage(announcement, msgMatcher);
      this.assert(
        isCompatibleMessage,
        `expected to announce message ${placeholder} #{exp} but got #{act}`,
        `expected to not announce message ${placeholder} #{exp}`,
        msgMatcher,
        announcement,
      );
    }

    if (msgMatcher && announcement == null) {
      this.assert(
        announcement,
        "expected to announce #{exp}",
        "expected to not announce #{exp}",
        msgMatcher,
        announcement,
      );
    }

    // @ts-expect-error
    cy.state("announcement", null);
    utils.flag(this, "object", announcement);
  }

  _chai.Assertion.addMethod("announce", assertAnnounces);
};
chai.use(announces);

/**
 * Checks if the class includes the expected highlighted class
 *
 * @example
 * cy.findByRole('option).should('be.highlighted')
 */
const isHighlighted: ChaiPlugin = (_chai, _utils) => {
  function assertIsHighlighted(this: AssertionStatic) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const className = this._obj.attr("class");

    this.assert(
      className.match(/saltHighlighted/),
      `expected \n${elementToString(
        root,
      )} to include CSS class #{exp}, got #{act} instead.`,
      `expected \n${elementToString(root)} not to have class #{exp}.`,
      "saltHighlighted",
      className,
    );
  }

  _chai.Assertion.addMethod("highlighted", assertIsHighlighted);
};

// registers our assertion function "isHighlighted" with Chai
chai.use(isHighlighted);

/**
 * Checks if the class includes the expected saltFocusVisible class
 *
 * @example
 * cy.findByRole('option).should('have.focusVisible')
 */
const hasFocusVisible: ChaiPlugin = (_chai, _utils) => {
  function assertHasFocusVisible(this: AssertionStatic) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const className = this._obj.attr("class");

    this.assert(
      className.match(/saltFocusVisible/),
      `expected \n${elementToString(
        root,
      )} to include CSS class #{exp}, got #{act} instead.`,
      `expected \n${elementToString(root)} not to have class #{exp}.`,
      "saltFocusVisible",
      className,
    );
  }

  _chai.Assertion.addMethod("focusVisible", assertHasFocusVisible);
};

// registers our assertion function "isHighlighted" with Chai
chai.use(hasFocusVisible);

/**
 * Checks if the class includes the expected highlighted class
 *
 * @example
 * cy.findByRole('option).should('be.highlighted')
 */
const hasAriaSelected: ChaiPlugin = (_chai, _utils) => {
  function assertHasAriaSelected(this: AssertionStatic) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const ariaSelected = this._obj.attr("aria-selected");

    this.assert(
      ariaSelected === "true",
      `expected \n${elementToString(
        root,
      )} to have aria-selected #{exp}, got #{act} instead.`,
      `expected \n${elementToString(
        root,
      )} to have aria-selected = #{exp}, got #{act} instead`,
      "true",
      ariaSelected,
    );
  }

  _chai.Assertion.addMethod("ariaSelected", assertHasAriaSelected);
};

// registers our assertion function "isHighlighted" with Chai
chai.use(hasAriaSelected);

/**
 * Checks if the element is in the viewport
 *
 * @example
 * cy.findByRole('option).should('be.inTheViewport')
 */
const isInTheViewport: ChaiPlugin = (_chai, _utils) => {
  function assertIsInTheViewport(this: AssertionStatic) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const viewportHeight = Cypress.config("viewportHeight");
    const rect = root.getBoundingClientRect();

    this.assert(
      !(rect.bottom < 0 || rect.top - viewportHeight >= 0),
      `expected \n${elementToString(root)} to be in the viewport.`,
      `expected \n${elementToString(root)} to not be in the viewport`,
      null,
    );
  }

  _chai.Assertion.addMethod("inTheViewport", assertIsInTheViewport);
};

// registers our assertion function "isInTheViewport" with Chai
chai.use(isInTheViewport);

/**
 * Checks if the element is in the viewport
 *
 * @example
 * cy.findByRole('option).should('be.activeDescendant')
 */
const isActiveDescendant: ChaiPlugin = (_chai) => {
  function assertIsActiveDescendant(this: AssertionStatic) {
    // make sure it's an Element
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`,
    ).to.equal(1);

    const id = root.id;
    cy.focused({ log: false }).then(($focused) => {
      this.assert(
        $focused.attr("aria-activedescendant") === id,
        "expected #{this} to be #{exp}",
        "expected #{this} not to be #{exp}",
        "active descendant",
      );
    });
  }

  _chai.Assertion.addMethod("activeDescendant", assertIsActiveDescendant);
};

// registers our assertion function "isFocused" with Chai
chai.use(isActiveDescendant);
