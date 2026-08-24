import axe, { type RunOptions } from "axe-core";
import type { ComponentType, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { renderWithSalt } from "~browser-test-utils/render";

type AccessibilityStory = ComponentType & {
  parameters?: {
    axe?: {
      disabledRules?: string[];
      skip?: boolean;
    };
  };
};

export async function runAxeScan(container: Element, options?: RunOptions) {
  const portalRoots = container.ownerDocument.querySelectorAll(
    "[data-floating-ui-portal]",
  );
  const context = {
    include: [container, ...portalRoots],
    exclude: ["[data-floating-ui-focus-guard]"],
  };
  const results = options
    ? await axe.run(context, options)
    : await axe.run(context);
  expect(results.violations).toEqual([]);
}

type StoryRenderer = (children: ReactNode) => ReturnType<typeof renderWithSalt>;
const ACCESSIBILITY_TEST_TIMEOUT = 30_000;

export function checkAccessibility(
  stories: Record<string, AccessibilityStory>,
  renderStory: StoryRenderer = renderWithSalt,
) {
  describe("Axe Testing", () => {
    for (const [name, StoryComponent] of Object.entries(stories)) {
      const disabledRules = StoryComponent.parameters?.axe?.disabledRules ?? [];
      const shouldSkip = StoryComponent.parameters?.axe?.skip ?? false;
      const testFunction = shouldSkip ? it.skip : it;

      testFunction(
        `Story "${name}", should not have axe violations`,
        async () => {
          const { container } = await renderStory(<StoryComponent />);
          const rules = disabledRules.reduce<NonNullable<RunOptions["rules"]>>(
            (result, rule) => {
              result[rule] = { enabled: false };
              return result;
            },
            {},
          );
          await runAxeScan(container, { rules });
        },
        ACCESSIBILITY_TEST_TIMEOUT,
      );
    }
  });
}
