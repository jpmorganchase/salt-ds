import { ViewportProvider, useViewport } from "@jpmorganchase/uitk-core";
import { mount } from "cypress/react";

const TestComponent = () => {
  const width = useViewport();

  return <div>{width}</div>;
};

describe("Given a ViewportProvider", () => {
  it("useViewport should return the width of the viewport", () => {
    cy.viewport(550, 750);
    mount(
      <ViewportProvider>
        <TestComponent />
      </ViewportProvider>
    );

    cy.findByText("550");
    cy.viewport(650, 750);
    cy.findByText("650");
  });
});
