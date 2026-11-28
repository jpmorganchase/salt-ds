import { LinkButton } from "@salt-ds/core";
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

describe("GIVEN LinkButton defaults", () => {
  it("SHOULD apply provider sentiment when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltLinkButton: { props: { sentiment: "accented" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <LinkButton href="#">Link</LinkButton>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltLinkButton-accented"))
      .toBeVisible();
  });
});
