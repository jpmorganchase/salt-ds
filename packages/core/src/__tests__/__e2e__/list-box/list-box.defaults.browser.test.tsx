import { ListBox, Option } from "@salt-ds/core";
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

describe("GIVEN ListBox defaults", () => {
  it("SHOULD apply provider bordered when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltListBox: { props: { bordered: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <ListBox>
          <Option value="one">One</Option>
        </ListBox>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltListBox-bordered")).toBeVisible();
  });
});
