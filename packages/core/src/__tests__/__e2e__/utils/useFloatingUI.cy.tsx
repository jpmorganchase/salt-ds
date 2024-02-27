import { mount } from "cypress/react18";
import {
  useFloatingComponent,
  SaltProvider,
  UNSTABLE_SaltProviderNext,
  useFloatingUI,
} from "@salt-ds/core";

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
        </SaltProvider>
      );

      cy.get("html.salt-theme").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme").should("have.length", 1);
    });
    it("should render a nested UNSTABLE_SaltProviderNext when used within another", () => {
      mount(
        <UNSTABLE_SaltProviderNext>
          <TestComponent focusManager={false} />
        </UNSTABLE_SaltProviderNext>
      );

      cy.get("html.salt-theme.salt-theme-next").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme.salt-theme-next").should(
        "have.length",
        1
      );
    });
  });
  describe("with focusManager", () => {
    it("should render a nested SaltProvider by default", () => {
      mount(
        <SaltProvider>
          <TestComponent focusManager={true} />
        </SaltProvider>
      );

      cy.get("html.salt-theme").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme").should("have.length", 1);
    });
    it("should render a nested UNSTABLE_SaltProviderNext when used within another", () => {
      mount(
        <UNSTABLE_SaltProviderNext>
          <TestComponent focusManager={true} />
        </UNSTABLE_SaltProviderNext>
      );

      cy.get("html.salt-theme.salt-theme-next").should("have.length", 1);
      cy.get("div.salt-provider.salt-theme.salt-theme-next").should(
        "have.length",
        1
      );
    });
  });
});
