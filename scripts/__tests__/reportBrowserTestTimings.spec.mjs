import { describe, expect, it } from "vitest";
import {
  extractFileTimings,
  toCsv,
  toMarkdown,
} from "../reportBrowserTestTimings.mjs";

describe("browser test timing reports", () => {
  it("sorts files by elapsed time and preserves assertion counts", () => {
    const files = extractFileTimings(
      {
        testResults: [
          {
            name: "/repo/test/browser/fast.browser.test.tsx",
            startTime: 100,
            endTime: 250,
            assertionResults: [{ status: "passed" }],
          },
          {
            name: "/repo/test/browser/slow.browser.test.tsx",
            startTime: 100,
            endTime: 5100,
            assertionResults: [
              { status: "passed" },
              { status: "failed" },
              { status: "pending" },
            ],
          },
        ],
      },
      "/repo",
    );

    expect(files).toEqual([
      {
        file: "test/browser/slow.browser.test.tsx",
        durationMs: 5000,
        tests: 3,
        passed: 1,
        failed: 1,
        skipped: 1,
      },
      {
        file: "test/browser/fast.browser.test.tsx",
        durationMs: 150,
        tests: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
      },
    ]);
    expect(toCsv(files)).toContain(
      '"test/browser/slow.browser.test.tsx",5000,3,1,1,1',
    );
    expect(toMarkdown(files)).toContain("5.00s | 3");
  });

  it("keeps untimed files visible in CSV without inventing durations", () => {
    const files = extractFileTimings({
      testResults: [{ name: "missing.browser.test.tsx", assertionResults: [] }],
    });

    expect(files[0].durationMs).toBeNull();
    expect(toCsv(files)).toContain('"missing.browser.test.tsx",,0,0,0,0');
    expect(toMarkdown(files)).toContain("Measured 0/1 files");
  });
});
