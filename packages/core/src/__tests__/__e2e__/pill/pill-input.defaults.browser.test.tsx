import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

import { PillInput } from "../../../pill-input";

const elementByClass = (className: string) => {
  const element = document.querySelector(`.${className}`);
  if (!element)
    throw new Error(`Could not find element with class ${className}`);
  return page.elementLocator(element);
};

describe("GIVEN PillInput defaults", () => {
  it("SHOULD apply provider bordered when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltPillInput: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <PillInput pills={["One"]} />
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltPillInput-bordered"))
      .toBeVisible();
  });
});
