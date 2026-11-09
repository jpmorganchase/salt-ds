import { ToggleButton } from "@salt-ds/core";
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

describe("GIVEN ToggleButton defaults", () => {
  it("SHOULD apply provider appearance when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltToggleButton: { props: { appearance: "bordered" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <ToggleButton value="one">One</ToggleButton>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltToggleButton-bordered"))
      .toBeVisible();
  });
});
