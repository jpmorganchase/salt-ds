import { CSPProvider, useComponentCssInjection } from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

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

function injectedStyle() {
  const style = document.querySelector<HTMLStyleElement>(
    'head style[data-salt-style="csp-provider-test"]',
  );
  if (!style) throw new Error("Missing injected style");
  return style;
}

describe("Given a CSPProvider", () => {
  it("applies its nonce to dynamically injected styles", async () => {
    await render(
      <CSPProvider nonce="salt-style-nonce">
        <StyleInjectionTest />
      </CSPProvider>,
    );

    expect(injectedStyle().nonce).toBe("salt-style-nonce");
  });

  it("allows the hook nonce to override the provider nonce", async () => {
    await render(
      <CSPProvider nonce="salt-style-nonce">
        <StyleInjectionTest nonce="salt-style-nonce-override" />
      </CSPProvider>,
    );

    expect(injectedStyle().nonce).toBe("salt-style-nonce-override");
  });
});
