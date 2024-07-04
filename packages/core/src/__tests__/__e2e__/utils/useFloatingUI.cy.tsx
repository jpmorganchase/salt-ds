import {
  SaltProvider,
  SaltProviderNext,
  useFloatingComponent,
  useFloatingUI
} from "@salt-ds/core";
import { mount } from "cypress/react18";

const TestComponent = ({
  id = "test-1",
  contentId = "test-1-content",
  focusManager,
  open = true,
}: {
  id?: string;
  contentId?: string;
  focusManager?: boolean;
  open?: boolean;
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
        </SaltProviderNext>
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
        </SaltProviderNext>
      );

      cy.get("html.salt-theme.salt-theme-next").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme.salt-theme-next").should(
        "have.length",
        1,
      );
    });
  });
});
