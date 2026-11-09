import { Table, TFoot, THead } from "@salt-ds/core";
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

describe("GIVEN Table defaults", () => {
  it("SHOULD apply provider variant for Table", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTable: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Table>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </Table>
      </ComponentDefaultsProvider>,
    );

    await expect.element(elementByClass("saltTable-secondary")).toBeVisible();
  });

  it("SHOULD apply provider variant for THead", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTHead: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Table>
          <THead>
            <tr>
              <th>Head</th>
            </tr>
          </THead>
        </Table>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltTable-thead-secondary"))
      .toBeVisible();
  });

  it("SHOULD apply provider variant for TFoot", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTFoot: { props: { variant: "secondary" } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Table>
          <TFoot>
            <tr>
              <td>Foot</td>
            </tr>
          </TFoot>
        </Table>
      </ComponentDefaultsProvider>,
    );

    await expect
      .element(elementByClass("saltTable-tfoot-secondary"))
      .toBeVisible();
  });
});
