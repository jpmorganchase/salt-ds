import axe, { type RunOptions } from "axe-core";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { renderWithSalt } from "../render";

type BenchmarkStory = ComponentType & {
  parameters?: {
    axe?: {
      disabledRules?: string[];
      skip?: boolean;
    };
  };
};

export async function runAxeScan(container: Element) {
  await axe.run(container);
}

export function checkAccessibility(stories: Record<string, BenchmarkStory>) {
  describe("Axe Testing", () => {
    for (const [name, StoryComponent] of Object.entries(stories)) {
      const disabledRules = StoryComponent.parameters?.axe?.disabledRules ?? [];
      const shouldSkip = StoryComponent.parameters?.axe?.skip ?? false;
      const testFunction = shouldSkip ? it.skip : it;

      testFunction(
        `Story "${name}", should not have axe violations`,
        async () => {
          const { container } = await renderWithSalt(<StoryComponent />);
          const rules = disabledRules.reduce<NonNullable<RunOptions["rules"]>>(
            (result, rule) => {
              result[rule] = { enabled: false };
              return result;
            },
            {},
          );
          const results = await axe.run(container, { rules });

          expect(results.violations).toEqual([]);
        },
      );
    }
  });
}
