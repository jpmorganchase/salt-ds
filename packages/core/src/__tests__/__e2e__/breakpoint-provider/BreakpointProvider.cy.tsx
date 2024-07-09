import { useBreakpoint } from "@salt-ds/core";

function TestComponent() {
  const { matchedBreakpoints } = useBreakpoint();

  return <div>{matchedBreakpoints.join(",")}</div>;
}

describe("Given a BreakpointProvider", () => {
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
