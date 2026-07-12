import { SaltProvider, useBreakpoint } from "@salt-ds/core";
import { SecondaryWindow } from "../../../../../../cypress/support/SecondaryWindow";

const mediaQueryList = (media: string, matches: boolean): MediaQueryList => ({
  matches,
  media,
  onchange: null,
  addEventListener: Cypress.sinon.stub(),
  removeEventListener: Cypress.sinon.stub(),
  addListener: Cypress.sinon.stub(),
  removeListener: Cypress.sinon.stub(),
  dispatchEvent: Cypress.sinon.stub(),
});

function TestComponent() {
  const { matchedBreakpoints } = useBreakpoint();

  return <div>{matchedBreakpoints.join(",")}</div>;
}

describe("Given a BreakpointProvider", () => {
  it("uses matchMedia from the WindowProvider target", () => {
    const openerMatchMedia = cy
      .stub(window, "matchMedia")
      .callsFake((query) => mediaQueryList(query, false));
    const childMatchMedia = Cypress.sinon.stub().callsFake((query: string) => {
      const minWidth = Number(query.match(/\d+/)?.[0]);
      return mediaQueryList(query, minWidth <= 700);
    });

    cy.mount(
      <SecondaryWindow
        prepareWindow={(targetWindow) => {
          Object.defineProperty(targetWindow, "matchMedia", {
            configurable: true,
            value: childMatchMedia,
          });
        }}
      >
        <SaltProvider>
          <TestComponent />
        </SaltProvider>
      </SecondaryWindow>,
    );

    cy.get("iframe")
      .its("0.contentDocument.body")
      .should("contain.text", "sm,xs");
    cy.wrap(childMatchMedia).should("have.callCount", 5);
    cy.wrap(openerMatchMedia).should("have.callCount", 5);
  });

  it(
    "should return xl, lg, md, sm, xs if the viewport is above 1920",
    { viewportWidth: 1921 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("xl,lg,md,sm,xs");
    },
  );

  it(
    "should return lg, md, sm, xs if the viewport is 1919",
    { viewportWidth: 1919 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("lg,md,sm,xs");
    },
  );

  it(
    "should return lg, md, sm, xs if the viewport is 1280",
    { viewportWidth: 1280 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("lg,md,sm,xs");
    },
  );

  it(
    "should return md, sm, xs if the viewport is 1279",
    { viewportWidth: 1279 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("md,sm,xs");
    },
  );

  it(
    "should return md, sm, xs if the viewport is 960",
    { viewportWidth: 960 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("md,sm,xs");
    },
  );

  it(
    "should return sm, xs if the viewport is 959",
    { viewportWidth: 959 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("sm,xs");
    },
  );

  it(
    "should return sm, xs if the viewport is 600",
    { viewportWidth: 600 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("sm,xs");
    },
  );

  it(
    "should return xs if the viewport is less than 600",
    { viewportWidth: 599 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("xs");
    },
  );
});
