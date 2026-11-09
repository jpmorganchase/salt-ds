import { Banner } from "@salt-ds/core";
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

describe("GIVEN Banner defaults", () => {
  it("SHOULD apply provider variant when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltBanner: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Banner>Notice</Banner>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltBanner-secondary")).toBeVisible();
  });
});
