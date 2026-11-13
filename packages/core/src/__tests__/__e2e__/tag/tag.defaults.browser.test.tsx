import { Tag } from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const elementByClass = (className: string) => {
  const element = document.querySelector(`.${className}`);
  if (!element)
    throw new Error(`Could not find element with class ${className}`);
  return page.elementLocator(element);
};

describe("GIVEN Tag defaults", () => {
  it("SHOULD apply provider bordered when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTag: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Tag>Tag</Tag>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltTag-bordered")).toBeVisible();
  });
});
