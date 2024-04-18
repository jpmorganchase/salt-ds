import { useBreakpoint } from "@salt-ds/core";

function TestComponent() {
  const { matchedBreakpoints } = useBreakpoint();

  return <div>{matchedBreakpoints}</div>;
}

describe("Given a BreakpointProvider", () => {
  it(
    "should return XL, L, M, S, XS if the viewport is above 1920",
    { viewportWidth: 1921 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("XL,L,M,S,XS");
    }
  );

  it(
    "should return L, M, S, XS if the viewport is 1919",
    { viewportWidth: 1919 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("L,M,S,XS");
    }
  );

  it(
    "should return L, M, S, XS if the viewport is 1280",
    { viewportWidth: 1280 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("L,M,S,XS");
    }
  );

  it(
    "should return M, S, XS if the viewport is 1279",
    { viewportWidth: 1279 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("M,S,XS");
    }
  );

  it(
    "should return M, S, XS if the viewport is 960",
    { viewportWidth: 960 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("M,S,XS");
    }
  );

  it(
    "should return S, XS if the viewport is 959",
    { viewportWidth: 959 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("S,XS");
    }
  );

  it(
    "should return S, XS if the viewport is 600",
    { viewportWidth: 600 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("S,XS");
    }
  );

  it(
    "should return XS if the viewport is less than 600",
    { viewportWidth: 599 },
    () => {
      cy.mount(<TestComponent />);
      cy.findByText("XS");
    }
  );
});
