import { useViewport, ViewportContext, ViewportProvider } from "@salt-ds/core";
import { mount } from "cypress/react18";

const TestComponent = () => {
  const width = useViewport();

  return <div>{width}</div>;
};

describe("Given a ViewportProvider", () => {
  beforeEach(() => {
    cy.spy(global, "ResizeObserver").as("resizeObserver");
  });

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

  describe("WHEN there is no parent ViewportProvider", () => {
    it("THEN it should create a ResizeObserver", () => {
      mount(<ViewportProvider />);
      cy.get("@resizeObserver").should("have.been.calledOnce");
    });
  });

  describe("WHEN there is a parent ViewportProvider", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      mount(
        <ViewportProvider>
          <ViewportProvider />
        </ViewportProvider>
      );
      cy.get("@resizeObserver").should("have.been.calledOnce");
    });
  });

  describe("WHEN ViewportContext is not null", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      mount(
        <ViewportContext.Provider value={100}>
          <ViewportProvider />
        </ViewportContext.Provider>
      );
      cy.get("@resizeObserver").should("not.have.been.called");
    });
  });

  describe("WHEN ViewportContext is zero", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      mount(
        <ViewportContext.Provider value={0}>
          <ViewportProvider />
        </ViewportContext.Provider>
      );
      cy.get("@resizeObserver").should("not.have.been.called");
    });
  });

  describe("WHEN ViewportContext is null", () => {
    it("THEN it should create an additional ResizeObserver", () => {
      mount(
        <ViewportContext.Provider value={null}>
          <ViewportProvider />
        </ViewportContext.Provider>
      );
      cy.get("@resizeObserver").should("have.been.calledOnce");
    });
  });

  describe("WHEN ViewportProvider is initially mounted", () => {
    it("THEN the viewport width should be set to the body width", () => {
      cy.viewport(1000, 800);
      cy.stub(document.body, "getBoundingClientRect").returns({ width: 1000 });
      mount(
        <ViewportProvider>
          <TestComponent />
        </ViewportProvider>
      );
      cy.get('body').invoke('text').then((text) => {
        cy.log(`Found text: ${text}`);
      });
      
      cy.findByText("1000");
    });
  });
});
