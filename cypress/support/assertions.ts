import AssertionStatic = Chai.AssertionStatic;
import ChaiPlugin = Chai.ChaiPlugin;
import { computeAccessibleName } from "dom-accessibility-api";
import { prettyDOM } from "@testing-library/dom";

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
       * Checks if the announcement is matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).click().should('announce','Close')
       ```
       * */
      (chainer: "announce"): Chainable<Subject>;
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
const hasAccessibleName: ChaiPlugin = (_chai, utils) => {
  function assertHasAccessibleName(
    this: AssertionStatic,
    expectedName: string
  ) {
    const root = this._obj.get(0);
    // make sure it's an Element
    new _chai.Assertion(
      root.nodeType,
      `Expected an Element but got '${String(root)}'`
    ).to.equal(1);

    const actualName = computeAccessibleName(root, {
      computedStyleSupportsPseudoElements: true,
    });

    this.assert(
      actualName === expectedName,
      `expected \n${elementToString(
        root
      )} to have accessible name #{exp} but got #{act} instead.`,
      `expected \n${elementToString(root)} not to have accessible name #{exp}.`,
      expectedName,
      actualName
    );
  }

  _chai.Assertion.addMethod("accessibleName", assertHasAccessibleName);
};

// registers our assertion function "isFoo" with Chai
chai.use(hasAccessibleName);
const announces: ChaiPlugin = (_chai, utils) => {
  function assertAnnounces(
    this: AssertionStatic,
    msgMatcher?: string | RegExp
  ) {
    // @ts-ignore
    const announcement = cy.state("announcement") as string | null;

    // Checking if error was thrown
    if (msgMatcher === undefined) {
      this.assert(
        announcement !== null,
        "expected to announce message",
        "expected to not announce message but #{act} was announced",
        announcement
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
        "expected to announce message " +
          placeholder +
          " #{exp} but got #{act}",
        "expected to not announce message " + placeholder + " #{exp}",
        msgMatcher,
        announcement
      );
    }

    if (msgMatcher && announcement == null) {
      this.assert(
        announcement,
        "expected to announce #{exp}",
        "expected to not announce #{exp}",
        msgMatcher,
        announcement
      );
    }

    // @ts-ignore
    cy.state("announcement", null);
    utils.flag(this, "object", announcement);
  }

  _chai.Assertion.addMethod("announce", assertAnnounces);
};
chai.use(announces);
export {};
