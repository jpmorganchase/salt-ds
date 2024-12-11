import {
  SaltProvider,
  SaltProviderNext,
  useFloatingComponent,
  useFloatingUI,
} from "@salt-ds/core";
import { mount } from "cypress/react18";

const TestComponent = ({
  id = "test-1",
  contentId = "test-1-content",
  focusManager,
  open = true,
  disableScroll = false,
}: {
  id?: string;
  contentId?: string;
  focusManager?: boolean;
  open?: boolean;
  disableScroll?: boolean;
}) => {
  const { Component: FloatingComponent } = useFloatingComponent();
  const { context } = useFloatingUI({
    open,
  });
  return (
    <div id={id}>
      <FloatingComponent
        open={Boolean(open)}
        focusManagerProps={focusManager ? { context } : undefined}
        disableScroll={disableScroll}
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
  describe("without disableScroll", () => {
    it("the document body should not have hidden overflow", () => {
      mount(
        <SaltProvider>
          <TestComponent disableScroll={false} />
        </SaltProvider>,
      );

      cy.document().its("documentElement.style.overflow").should("equal", "");
    });
  });
  describe("with disableScroll", () => {
    it("the document body should have hidden overflow", () => {
      mount(
        <SaltProvider>
          <TestComponent disableScroll={true} />
        </SaltProvider>,
      );

      cy.document()
        .its("documentElement.style.overflow")
        .should("equal", "hidden");
    });
  });
});
