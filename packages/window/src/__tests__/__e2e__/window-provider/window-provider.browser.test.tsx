import { useWindow, WindowProvider } from "@salt-ds/window";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

function TestComponent() {
  const targetWindow = useWindow();
  return (
    <div data-testid="result">
      {targetWindow === null
        ? "null"
        : targetWindow === window
          ? "global"
          : "custom"}
    </div>
  );
}

describe("Given a WindowProvider", () => {
  it("useWindow returns the global window when rendered without a provider", async () => {
    render(<TestComponent />);

    await expect
      .element(page.getByTestId("result"))
      .toHaveTextContent("global");
  });

  it("useWindow returns the window passed to the provider", async () => {
    render(
      <WindowProvider window={window}>
        <TestComponent />
      </WindowProvider>,
    );

    await expect
      .element(page.getByTestId("result"))
      .toHaveTextContent("global");
  });

  it("useWindow returns null when the provider is given null", async () => {
    render(
      <WindowProvider window={null}>
        <TestComponent />
      </WindowProvider>,
    );

    await expect.element(page.getByTestId("result")).toHaveTextContent("null");
  });

  it("a nested provider overrides the value for its subtree only", async () => {
    function Nested() {
      return (
        <div data-testid="outer">
          <TestComponent />
          <WindowProvider window={null}>
            <div data-testid="inner">
              <TestComponent />
            </div>
          </WindowProvider>
        </div>
      );
    }

    render(
      <WindowProvider window={window}>
        <Nested />
      </WindowProvider>,
    );

    const outerResult = page.getByTestId("outer").getByTestId("result").first();
    const innerResult = page.getByTestId("inner").getByTestId("result");

    await expect.element(outerResult).toHaveTextContent("global");
    await expect.element(innerResult).toHaveTextContent("null");
  });

  it("consumers re-render when the provider's window value changes", async () => {
    function ToggleableProvider() {
      const [useNull, setUseNull] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setUseNull(true)}>
            switch
          </button>
          <WindowProvider window={useNull ? null : window}>
            <TestComponent />
          </WindowProvider>
        </div>
      );
    }

    render(<ToggleableProvider />);

    await expect
      .element(page.getByTestId("result"))
      .toHaveTextContent("global");

    await page.getByText("switch").click();

    await expect.element(page.getByTestId("result")).toHaveTextContent("null");
  });
});
