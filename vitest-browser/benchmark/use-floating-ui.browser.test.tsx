import {
  SaltProvider,
  SaltProviderNext,
  useFloatingComponent,
  useFloatingUI,
} from "@salt-ds/core";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

function TestComponent({
  focusManager,
  lockScroll = false,
}: {
  focusManager?: boolean;
  lockScroll?: boolean;
}) {
  const { Component: FloatingComponent } = useFloatingComponent();
  const { context } = useFloatingUI({ open: true });

  useEffect(() => {
    const originalHeight = document.body.style.height;
    document.body.style.height = "300vh";
    return () => {
      document.body.style.height = originalHeight;
    };
  }, []);

  return (
    <div id="test-1">
      <FloatingComponent
        open
        focusManagerProps={focusManager ? { context } : undefined}
        lockScroll={lockScroll}
      >
        <div id="test-1-content" />
      </FloatingComponent>
    </div>
  );
}

function expectProviderClasses(next = false) {
  const suffix = next ? ".salt-theme-next" : "";
  expect(document.querySelectorAll(`html.salt-theme${suffix}`)).toHaveLength(1);
  expect(
    document.querySelectorAll(`div.salt-provider.salt-theme${suffix}`),
  ).toHaveLength(1);
}

describe("Use useFloatingComponent", () => {
  it.each([false, true])(
    "renders a nested SaltProvider with focusManager=%s",
    async (focusManager) => {
      await render(
        <SaltProvider>
          <TestComponent focusManager={focusManager} />
        </SaltProvider>,
      );
      expectProviderClasses();
    },
  );

  it.each([false, true])(
    "renders a nested SaltProviderNext with focusManager=%s",
    async (focusManager) => {
      await render(
        <SaltProviderNext>
          <TestComponent focusManager={focusManager} />
        </SaltProviderNext>,
      );
      expectProviderClasses(true);
    },
  );

  it("does not lock document scrolling by default", async () => {
    await render(
      <SaltProvider>
        <TestComponent />
      </SaltProvider>,
    );
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("locks document scrolling when requested", async () => {
    await render(
      <SaltProvider>
        <TestComponent lockScroll />
      </SaltProvider>,
    );
    await expect
      .poll(() => document.documentElement.style.overflow)
      .toBe("hidden");
  });
});
