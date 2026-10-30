import { SaltProvider, useBreakpoint } from "@salt-ds/core";
import { memo, useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

function TestComponent() {
  const { matchedBreakpoints } = useBreakpoint();
  return <div>{matchedBreakpoints.join(",")}</div>;
}

const cases = [
  [1921, "xl,lg,md,sm,xs"],
  [1919, "lg,md,sm,xs"],
  [1280, "lg,md,sm,xs"],
  [1279, "md,sm,xs"],
  [960, "md,sm,xs"],
  [959, "sm,xs"],
  [600, "sm,xs"],
  [599, "xs"],
] as const;

afterEach(() => page.viewport(1280, 1024));

describe("Given a BreakpointProvider", () => {
  it.each(cases)("matches breakpoints at %ipx", async (width, expected) => {
    await page.viewport(width, 1024);
    await renderWithSalt(<TestComponent />);
    await expect.element(page.getByText(expected)).toBeInTheDocument();
  });

  it("doesn't re-render consumers when a provider re-renders", async () => {
    let renders = 0;
    // Memoised with no props, so it only re-renders when a context it reads changes.
    const Consumer = memo(function Consumer() {
      useBreakpoint();
      renders += 1;
      return null;
    });
    function Host() {
      const [count, setCount] = useState(0);
      return (
        <SaltProvider>
          <button type="button" onClick={() => setCount(count + 1)}>
            Re-render {count}
          </button>
          <Consumer />
        </SaltProvider>
      );
    }

    await renderWithSalt(<Host />);
    const rendersAfterMount = renders;
    await page.getByRole("button").click();
    await page.getByRole("button").click();
    await expect.element(page.getByText("Re-render 2")).toBeInTheDocument();
    expect(renders).toBe(rendersAfterMount);
  });
});
