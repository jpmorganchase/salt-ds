import { ComboBox, Dropdown, Option } from "@salt-ds/core";
import { Profiler, useMemo, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "vitest-browser-react";
import { renderWithSalt } from "~browser-test-utils/render";

afterEach(() => vi.restoreAllMocks());

const painted = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const scenarios = [20, 1_000, 10_000].flatMap((count) =>
  [false, true].flatMap((rich) =>
    [false, true].flatMap((multiselect) =>
      ["Dropdown", "ComboBox"].map((control) => ({
        count,
        rich,
        multiselect,
        control,
      })),
    ),
  ),
);

// Separate from correctness tests: wall-clock results are recorded, never used
// as CI pass/fail thresholds. Run the same file against both revisions.
describe.each(scenarios)(
  "list interaction measurements: $control $count rich=$rich multi=$multiselect",
  (scenario) => {
    it("records three mount/focus/open/interact/filter/reopen samples", async () => {
      const { count, rich, multiselect, control } = scenario;
      const measurements: Record<string, unknown>[] = [];
      let commits = 0;
      let filterOptions = (_value: string) => {};
      function Fixture() {
        const [filter, setFilter] = useState("");
        filterOptions = setFilter;
        const options = useMemo(
          () =>
            Array.from({ length: count }, (_, index) => {
              const value = `Item ${index}`;
              return {
                value,
                node: (
                  <Profiler key={value} id={value} onRender={() => commits++}>
                    <Option value={value}>
                      {rich ? (
                        <div>
                          <strong>{value}</strong>
                          <span> Description {index}</span>
                          <span aria-hidden="true"> • </span>
                        </div>
                      ) : (
                        value
                      )}
                    </Option>
                  </Profiler>
                ),
              };
            }),
          [],
        );
        const children = options
          .filter(({ value }) => value.includes(filter))
          .map(({ node }) => node);
        return control === "Dropdown" ? (
          <Dropdown multiselect={multiselect}>{children}</Dropdown>
        ) : (
          <ComboBox
            multiselect={multiselect}
            onChange={(event) => setFilter(event.target.value)}
          >
            {children}
          </ComboBox>
        );
      }

      const scans = vi.spyOn(Element.prototype, "querySelectorAll");
      const comparisons = vi.spyOn(Node.prototype, "compareDocumentPosition");
      const longTasks: PerformanceEntry[] = [];
      const observer = new PerformanceObserver((list) =>
        longTasks.push(...list.getEntries()),
      );
      observer.observe({ type: "longtask", buffered: false });
      try {
        for (let sample = 0; sample < 3; sample++) {
          await cleanup();
          await painted();
          const measure = async (name: string, action: () => unknown) => {
            commits = 0;
            scans.mockClear();
            comparisons.mockClear();
            longTasks.length = 0;
            const start = performance.now();
            await action();
            await painted();
            const end = performance.now();
            measurements.push({
              sample,
              name,
              ms: Number((end - start).toFixed(2)),
              commits,
              collectionScans: scans.mock.calls.filter(
                ([selector]) => selector === '[role="option"]',
              ).length,
              orderComparisons: comparisons.mock.calls.length,
              longTasks: longTasks
                .filter(
                  (entry) => entry.startTime >= start && entry.startTime < end,
                )
                .map((entry) => Number(entry.duration.toFixed(2))),
            });
          };
          await measure("mount", () => renderWithSalt(<Fixture />));
          const input =
            document.querySelector<HTMLElement>('[role="combobox"]');
          if (!input) throw new Error("Missing combobox");
          const key = (value: string) =>
            input.dispatchEvent(
              new KeyboardEvent("keydown", { key: value, bubbles: true }),
            );
          await measure("first-focus", () => input.focus());
          await measure("first-open", () => {
            key("ArrowDown");
          });
          expect(document.querySelectorAll('[role="option"]')).toHaveLength(
            count,
          );
          const optionElements = document.querySelectorAll('[role="option"]');
          for (let step = 0; step < 5; step++) {
            await measure("keyboard", () => {
              key("ArrowDown");
            });
            await measure("pointer", () => {
              optionElements[step].dispatchEvent(
                new MouseEvent("mouseover", { bubbles: true }),
              );
            });
          }
          await measure("select", () => {
            key("Enter");
          });
          if (input.getAttribute("aria-expanded") !== "true") {
            await measure("reopen-selected", () => {
              key("ArrowDown");
            });
          }
          await measure("filter", () => filterOptions(String(count - 1)));
          expect(document.querySelectorAll('[role="option"]')).toHaveLength(1);
          await measure("clear-filter", () => filterOptions(""));
          expect(document.querySelectorAll('[role="option"]')).toHaveLength(
            count,
          );
          await measure("close", () => {
            key("Escape");
            input.blur();
          });
          await measure("reopen", () => {
            input.focus();
            key("ArrowDown");
          });
          expect(input.getAttribute("aria-expanded")).toBe("true");
        }
      } finally {
        observer.disconnect();
      }
      console.log(
        "LIST_CONTROL_BENCHMARK",
        JSON.stringify({ scenario, measurements }),
      );
    });
  },
);
