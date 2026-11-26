import {
  ContentStatus,
  Dropdown,
  Metric,
  MetricContent,
  MetricHeader,
  Tab,
  Tabstrip,
  useEventCallback,
} from "@salt-ds/lab";
import { createRef } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN deprecated lab exports", () => {
  let warnSpy: MockInstance<typeof console.warn>;

  const deprecationWarnings = () =>
    warnSpy.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes("from @salt-ds/lab is deprecated"));

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn");
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns once, naming the replacement, when a deprecated component renders", async () => {
    const { rerender } = await renderWithSalt(<ContentStatus id="1" />);
    await rerender(<ContentStatus id="1" status="success" />);
    await renderWithSalt(<ContentStatus id="2" />);

    expect(deprecationWarnings()).toEqual([
      "ContentStatus from @salt-ds/lab is deprecated and will be removed in a future release. Follow the content status pattern instead: https://www.saltdesignsystem.com/salt/patterns/content-status",
    ]);
  });

  it("forwards refs to the deprecated component", async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithSalt(
      <Metric ref={ref}>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>,
    );

    expect(ref.current).toHaveClass("saltMetric");
  });

  it("only warns for the components that are used, not the ones they use internally", async () => {
    await renderWithSalt(<Dropdown source={["Bar", "Foo"]} />);
    expect(document.querySelector(".saltDropdownBase")).not.toBeNull();
    expect(document.querySelector(".saltDropdownButton")).not.toBeNull();

    expect(deprecationWarnings()).toEqual([
      "Dropdown from @salt-ds/lab is deprecated and will be removed in a future release. Use Dropdown from @salt-ds/core instead.",
    ]);
  });

  it("warns when a deprecated hook is called", async () => {
    const Component = () => {
      useEventCallback(() => {});
      return null;
    };
    await renderWithSalt(<Component />);

    expect(deprecationWarnings()).toEqual([
      "useEventCallback from @salt-ds/lab is deprecated and will be removed in a future release.",
    ]);
  });

  // Tabstrip only passes selection to children whose type is Tab, so this
  // fails if the Tab export is wrapped.
  it("keeps components that lab compares by type working", async () => {
    await renderWithSalt(
      <Tabstrip>
        <Tab label="Home" />
        <Tab label="Transactions" />
      </Tabstrip>,
    );

    await expect
      .element(page.getByRole("tab", { name: /Home/ }))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(page.getByRole("tab", { name: /Transactions/ }))
      .toHaveAttribute("aria-selected", "false");
    expect(deprecationWarnings()).toEqual([
      "Tabstrip from @salt-ds/lab is deprecated and will be removed in a future release. Use Tabs from @salt-ds/core instead.",
    ]);
  });
});
