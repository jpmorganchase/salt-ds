import { describe, expect, it, vi } from "vitest";
import {
  CSS_BUNDLE_LANES,
  runCssBundleLanes,
} from "../../../../scripts/bundleCss.mjs";

describe("CSS bundle coordinator", () => {
  it("runs each lane in order and waits for every lane", async () => {
    const completed: string[] = [];
    await runCssBundleLanes(async (scriptName: string) => {
      completed.push(scriptName);
    });

    for (const lane of CSS_BUNDLE_LANES) {
      const positions = lane.map((scriptName) => completed.indexOf(scriptName));
      expect(positions).toEqual(
        [...positions].sort((left, right) => left - right),
      );
    }
    expect(completed).toHaveLength(CSS_BUNDLE_LANES.flat().length);
  });

  it("reports a failed lane even when the other lane succeeds", async () => {
    const runScript = vi.fn(async (scriptName: string) => {
      if (scriptName === "bundle:core:css") {
        throw new Error("core CSS failed");
      }
    });

    await expect(runCssBundleLanes(runScript)).rejects.toThrow(
      /CSS bundle lanes failed/u,
    );
    expect(runScript).toHaveBeenCalledWith("copy:countries:css");
    expect(runScript).not.toHaveBeenCalledWith("bundle:lab:css");
  });
});
