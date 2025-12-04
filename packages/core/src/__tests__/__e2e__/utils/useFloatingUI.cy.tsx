import {
  SaltProvider,
  SaltProviderNext,
  useFloatingComponent,
  useFloatingUI,
} from "@salt-ds/core";
import { mount } from "cypress/react";
import { useEffect } from "react";

const TestComponent = ({
  id = "test-1",
  contentId = "test-1-content",
  focusManager,
  open = true,
  lockScroll = false,
}: {
  id?: string;
  contentId?: string;
  focusManager?: boolean;
  open?: boolean;
  lockScroll?: boolean;
}) => {
  const { Component: FloatingComponent } = useFloatingComponent();
  const { context } = useFloatingUI({
    open,
  });

  useEffect(() => {
    const originalHeight = document.body.style.height;
    document.body.style.height = "300vh";

    return () => {
      document.body.style.height = originalHeight;
    };
  }, []);

  return (
    <div id={id}>
      <FloatingComponent
        open={Boolean(open)}
        focusManagerProps={focusManager ? { context } : undefined}
        lockScroll={lockScroll}
      >
        <div id={contentId} />
      </FloatingComponent>
    </div>
  );
};

describe("Use useFloatingComponent", () => {
  describe("without focusManager", () => {
    it("should render a nested SaltProvider by default", () => {
      mount(
        <SaltProvider>
          <TestComponent focusManager={false} />
        </SaltProvider>,
      );

      cy.get("html.salt-theme").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme").should("have.length", 1);
    });
    it("should render a nested SaltProviderNext when used within another", () => {
      mount(
        <SaltProviderNext>
          <TestComponent focusManager={false} />
        </SaltProviderNext>,
      );

      cy.get("html.salt-theme.salt-theme-next").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme.salt-theme-next").should(
        "have.length",
        1,
      );
    });
  });
  describe("with focusManager", () => {
    it("should render a nested SaltProvider by default", () => {
      mount(
        <SaltProvider>
          <TestComponent focusManager={true} />
        </SaltProvider>,
      );

      cy.get("html.salt-theme").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme").should("have.length", 1);
    });
    it("should render a nested SaltProviderNext when used within another", () => {
      mount(
        <SaltProviderNext>
          <TestComponent focusManager={true} />
        </SaltProviderNext>,
      );

      cy.get("html.salt-theme.salt-theme-next").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme.salt-theme-next").should(
        "have.length",
        1,
      );
    });
  });
  describe("without lockScroll", () => {
    it("the document body should not have hidden overflow", () => {
      mount(
        <SaltProvider>
          <TestComponent lockScroll={false} />
        </SaltProvider>,
      );

      cy.document().its("documentElement.style.overflow").should("equal", "");
    });
  });
  describe("with lockScroll", () => {
    it("the document body should have hidden overflow", () => {
      mount(
        <SaltProvider>
          <TestComponent lockScroll />
        </SaltProvider>,
      );

      cy.document()
        .its("documentElement.style.overflow")
        .should("equal", "hidden");
    });
  });
});
