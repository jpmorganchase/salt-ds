import { useViewport, ViewportContext, ViewportProvider } from "@salt-ds/core";
import { mount } from "cypress/react";
import { useEffect } from "react";
import { SecondaryWindow } from "../../../../../../cypress/support/SecondaryWindow";

const TestComponent = ({
  onViewPortWidthChange,
}: {
  onViewPortWidthChange?: (width: number) => void;
}) => {
  const width = useViewport();
  useEffect(() => {
    onViewPortWidthChange?.(width);
  }, [width, onViewPortWidthChange]);
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
      </ViewportProvider>,
    );

    cy.findByText("550");
    cy.viewport(650, 750);
    cy.findByText("650");
  });

  it("measures and observes the WindowProvider body in a secondary window", () => {
    const observe = Cypress.sinon.stub();
    const disconnect = Cypress.sinon.stub();
    const childResizeObserver = Cypress.sinon.stub().callsFake(() => ({
      observe,
      disconnect,
    }));
    let childBody: HTMLElement | undefined;

    mount(
      <SecondaryWindow
        prepareWindow={(targetWindow) => {
          childBody = targetWindow.document.body;
          Cypress.sinon
            .stub(childBody, "getBoundingClientRect")
            .returns({ width: 777 } as DOMRect);
          Object.defineProperty(targetWindow, "ResizeObserver", {
            configurable: true,
            value: childResizeObserver,
          });
        }}
      >
        <ViewportProvider>
          <TestComponent />
        </ViewportProvider>
      </SecondaryWindow>,
    );

    cy.get("iframe")
      .its("0.contentDocument.body")
      .should("contain.text", "777");
    cy.wrap(childResizeObserver).should("have.been.calledOnce");
    cy.then(() => {
      expect(observe).to.have.been.calledOnceWith(childBody);
    });
    cy.get("@resizeObserver").should("not.have.been.called");
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
        </ViewportProvider>,
      );
      cy.get("@resizeObserver").should("have.been.calledOnce");
    });
  });

  describe("WHEN ViewportContext is not null", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      mount(
        <ViewportContext.Provider value={100}>
          <ViewportProvider />
        </ViewportContext.Provider>,
      );
      cy.get("@resizeObserver").should("not.have.been.called");
    });
  });

  describe("WHEN ViewportContext is zero", () => {
    it("THEN it should not create an additional ResizeObserver", () => {
      mount(
        <ViewportContext.Provider value={0}>
          <ViewportProvider />
        </ViewportContext.Provider>,
      );
      cy.get("@resizeObserver").should("not.have.been.called");
    });
  });

  describe("WHEN ViewportContext is null", () => {
    it("THEN it should create an additional ResizeObserver", () => {
      mount(
        <ViewportContext.Provider value={null}>
          <ViewportProvider />
        </ViewportContext.Provider>,
      );
      cy.get("@resizeObserver").should("have.been.calledOnce");
    });
  });

  describe("WHEN ViewportProvider is initially mounted", () => {
    it("THEN the viewport width should be set to the body width", () => {
      const widthChangeSpy = cy.spy().as("widthChange");

      cy.stub(document.body, "getBoundingClientRect").returns({ width: 1000 });
      mount(
        <ViewportProvider>
          <TestComponent onViewPortWidthChange={widthChangeSpy} />
        </ViewportProvider>,
      );

      cy.get("@widthChange").should("have.been.calledWith", 1000);
    });
  });
});
