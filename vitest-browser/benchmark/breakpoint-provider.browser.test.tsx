import { useBreakpoint } from "@salt-ds/core";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

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
});
