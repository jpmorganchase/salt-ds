import { composeStories } from "@storybook/react";
import * as skipLinkStories from "@stories/skip-link/skip-link.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { SkipLink, SkipLinks } from "@salt-ds/lab";

const composedStories = composeStories(skipLinkStories);
const { Default, MultipleLinks } = composedStories;

export const NoTargetRef = () => {
  return (
    <>
      <div>
        <span style={{ height: 50, lineHeight: "50px" }} tabIndex={-1}>
          Click here and press the Tab key to see the Skip Link
        </span>
        <div style={{ position: "relative", maxWidth: 500 }}>
          <SkipLinks>
            <SkipLink data-testid="skipLink" href="#main">
              Skip to main content
            </SkipLink>
          </SkipLinks>
          <div
            style={{
              borderTop: "2px solid grey",
              fontSize: 24,
              lineHeight: 3.5,
            }}
          >
            What we do
          </div>

          <article id="main">
            <section>
              <h1>Salt</h1>
              <p>
                Salt provides you with a suite of UI components and a flexible
                theming system. With no customisation, the default theme offers
                an attractive and modern look-and-feel, with both light and dark
                variants and support for a range of UI densities. We have
                included a theming system which allows you to easily create
                theme variations, or in fact substitute alternate themes.
              </p>
            </section>
            <section>
              <h1>Goals</h1>
              <p>Salt has been developed with the following design goals:</p>
              <ul>
                <li>
                  Providing a comprehensive set of commonly-used UI controls
                </li>
                <li>Complying with WCAG 2.1 accessibility guidelines</li>
                <li> To be lightweight and performant</li>
                <li> Offering flexible styling and theming support</li>
                <li> Minimizing dependencies on third-party libraries</li>
              </ul>
            </section>
          </article>
        </div>
      </div>
    </>
  );
};

describe("GIVEN a SkipLink", () => {
  checkAccessibility(composedStories);
  describe("WHEN there is a single SkipLink", () => {
    it("THEN it should move focus to the target element when interacted with", () => {
      cy.mount(<Default />);
      cy.findByText(
        "Click here and press the Tab key to see the Skip Link"
      ).click();
      cy.realPress("Tab");
      cy.findByTestId("skipLink").should("be.visible");
      cy.findByTestId("skipLink").click();

      cy.get("#main").should("be.focused");
    });

    it("THEN it should not move focus if no target ref is given", () => {
      cy.mount(<NoTargetRef />);
      cy.findByText(
        "Click here and press the Tab key to see the Skip Link"
      ).click();
      cy.realPress("Tab");
      cy.findByTestId("skipLink").should("be.visible");
      cy.findByTestId("skipLink").click();
      cy.findByTestId("skipLink").should("not.be.focused");
      cy.get("#main").should("not.be.focused");
    });
  });

  describe("WHEN there are multiple SkipLinks", () => {
    it("THEN it should move focus on to correct target when the appropriate link is interacted with", () => {
      cy.mount(<MultipleLinks />);
      cy.findByText(
        "Click here and press the Tab key to see the Skip Link"
      ).click();
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Enter");

      cy.get("#goals").should("be.focused");
      cy.get("#introduction").should("not.be.focused");
    });
  });
});
