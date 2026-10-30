import {
  GridLayout,
  resolveResponsiveValue,
  SaltProvider,
  StackLayout,
  useBreakpoint,
} from "@salt-ds/core";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// A server render measures no media queries, so only `xs` matches.
const render = (element: JSX.Element) =>
  renderToString(<SaltProvider>{element}</SaltProvider>);

function MatchedBreakpoints() {
  const { breakpoint, matchedBreakpoints } = useBreakpoint();
  return (
    <span>
      {breakpoint}:{matchedBreakpoints.join(",")}
    </span>
  );
}

describe("resolveResponsiveValue", () => {
  it("returns the value for the largest matched breakpoint", () => {
    expect(
      resolveResponsiveValue({ xs: 1, md: 3 }, ["lg", "md", "sm", "xs"]),
    ).toBe(3);
    expect(resolveResponsiveValue({ xs: 1, md: 3 }, ["sm", "xs"])).toBe(1);
    expect(resolveResponsiveValue(2, ["sm", "xs"])).toBe(2);
  });

  it("warns once about an object without an xs value", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveResponsiveValue({ md: 3 }, ["sm", "xs"])).toBeUndefined();
    resolveResponsiveValue({ lg: 2 }, ["sm", "xs"]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('{"md":3}');
    warn.mockRestore();
  });
});

describe("GIVEN a server render", () => {
  it("matches the xs breakpoint", () => {
    expect(render(<MatchedBreakpoints />)).toContain(
      "<span>xs<!-- -->:<!-- -->xs</span>",
    );
  });

  it("lays out StackLayout with its xs direction", () => {
    const html = render(
      <StackLayout direction={{ xs: "row", md: "column" }} />,
    );
    expect(html).toContain("saltStackLayout-row");
    expect(html).toContain("--flexLayout-direction:row");
  });
});

describe("GIVEN a responsive prop with no value for the current breakpoint", () => {
  it("lays out StackLayout as a column, its default", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = render(<StackLayout direction={{ md: "row" }} />);
    expect(html).toContain("saltStackLayout-column");
    expect(html).toContain("--flexLayout-direction:column");
  });

  it("uses the default gap", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const defaultGap = render(<StackLayout />).match(
      /--flexLayout-gap:([^;"]+)/,
    )?.[1];
    expect(defaultGap).toBeTruthy();
    expect(render(<StackLayout gap={{ md: 1 }} />)).toContain(
      `--flexLayout-gap:${defaultGap}`,
    );
    expect(render(<GridLayout gap={{ md: 1 }} />)).toContain(
      `--gridLayout-columnGap:${defaultGap}`,
    );
  });
});
