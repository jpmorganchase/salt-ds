import { describe, expect, it } from "vitest";
import {
  getCSSTokensFromElement,
  getNumericCSSToken,
} from "../compute-css-tokens";

const createElement = (
  tokens: Record<string, string>,
  rootFontSize = "16px",
) => {
  const documentElement = {};
  const element = {
    ownerDocument: {
      documentElement,
      defaultView: {
        getComputedStyle: (target: unknown) =>
          target === documentElement
            ? { fontSize: rootFontSize }
            : { getPropertyValue: (name: string) => tokens[name] ?? "" },
      },
    },
  };
  return element as unknown as Element;
};

describe("getCSSTokensFromElement", () => {
  it("returns px and non-length values unchanged", () => {
    const element = createElement({
      "--salt-spacing-100": " 8px ",
      "--salt-text-fontFamily": "Open Sans",
      "--salt-palette-corner-weak": "0",
    });

    expect(
      getCSSTokensFromElement(element, [
        "--salt-spacing-100",
        "--salt-text-fontFamily",
        "--salt-palette-corner-weak",
        "--salt-size-icon",
      ]),
    ).toEqual({
      "--salt-spacing-100": "8px",
      "--salt-text-fontFamily": "Open Sans",
      "--salt-palette-corner-weak": "0",
      "--salt-size-icon": undefined,
    });
  });

  it("resolves rem values to px using the root font size", () => {
    const element = createElement(
      {
        "--salt-spacing-100": "0.5rem",
        "--salt-size-icon": ".75rem",
        "--salt-text-fontSize": "0.75rem",
      },
      "32px",
    );

    const tokens = getCSSTokensFromElement(element, [
      "--salt-spacing-100",
      "--salt-size-icon",
      "--salt-text-fontSize",
    ]);

    expect(tokens).toEqual({
      "--salt-spacing-100": "16px",
      "--salt-size-icon": "24px",
      "--salt-text-fontSize": "24px",
    });
    expect(getNumericCSSToken(tokens, "--salt-spacing-100")).toBe(16);
  });

  it("leaves expressions containing rem unchanged", () => {
    const element = createElement({
      "--salt-spacing-150": "calc(1.5 * 0.5rem)",
    });

    expect(getCSSTokensFromElement(element, ["--salt-spacing-150"])).toEqual({
      "--salt-spacing-150": "calc(1.5 * 0.5rem)",
    });
  });
});
