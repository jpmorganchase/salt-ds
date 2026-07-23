import { CSPProvider, useComponentCssInjection } from "@salt-ds/styles";
import { mount } from "cypress/react";

const TEST_CSS = ".salt-csp-provider-test { color: rgb(1, 2, 3); }";

function StyleInjectionTest({ nonce }: { nonce?: string }) {
  useComponentCssInjection({
    testId: "csp-provider-test",
    css: TEST_CSS,
    nonce,
    window: globalThis.window,
  });

  return <div className="salt-csp-provider-test">CSP provider test</div>;
}

describe("Given a CSPProvider", () => {
  it("should apply nonce to dynamically injected style tags", () => {
    mount(
      <CSPProvider nonce="salt-style-nonce">
        <StyleInjectionTest />
      </CSPProvider>,
    );

    cy.get('head style[data-salt-style="csp-provider-test"]').should(
      "have.prop",
      "nonce",
      "salt-style-nonce",
    );
  });

  it("should allow useComponentCssInjection nonce to override the provider nonce", () => {
    mount(
      <CSPProvider nonce="salt-style-nonce">
        <StyleInjectionTest nonce="salt-style-nonce-override" />
      </CSPProvider>,
    );

    cy.get('head style[data-salt-style="csp-provider-test"]').should(
      "have.prop",
      "nonce",
      "salt-style-nonce-override",
    );
  });
});
