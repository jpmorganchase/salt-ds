/* eslint-disable @typescript-eslint/no-unsafe-call */
// @ts-ignore
import { validate } from "csstree-validator";

function getCSSText(rule: string, value: string) {
  return `body: { ${rule}: ${value} }`;
}

function isValid(syntaxErrors: any[]) {
  return !syntaxErrors.length;
}

export function validateTokenInput(tokenPath: string, input: string): boolean {
  if (!input.length) {
    return false;
  }

  input = input.toLowerCase();

  if (tokenPath.includes("border-style")) {
    return isValid(validate(getCSSText("border-style", input), ""));
  }

  if (tokenPath.includes("border-radius")) {
    return isValid(validate(getCSSText("border-radius", input), ""));
  }

  if (tokenPath.includes("border-width")) {
    return isValid(validate(getCSSText("border-width", input), ""));
  }

  if (tokenPath.includes("letter-spacing")) {
    return isValid(validate(getCSSText("letter-spacing", input), ""));
  }

  if (tokenPath.includes("text-transform")) {
    return isValid(validate(getCSSText("text-transform", input), ""));
  }

  if (tokenPath.includes("text-align")) {
    return isValid(validate(getCSSText("text-align", input), ""));
  }

  if (tokenPath.includes("text-decoration")) {
    return isValid(validate(getCSSText("text-decoration", input), ""));
  }

  if (tokenPath.includes("font-size")) {
    return isValid(validate(getCSSText("font-size", input), ""));
  }

  if (tokenPath.includes("typography-weight")) {
    return isValid(validate(getCSSText("font-weight", input), ""));
  }

  if (tokenPath.includes("zindex")) {
    return isValid(validate(getCSSText("z-index", input), ""));
  }

  if (tokenPath.includes("line-height")) {
    return isValid(validate(getCSSText("line-height", input), ""));
  }

  if (tokenPath.includes("outline-style")) {
    return isValid(validate(getCSSText("outline-style", input), ""));
  }

  if (tokenPath.includes("outline-offset")) {
    return isValid(validate(getCSSText("outline-offset", input), ""));
  }

  if (tokenPath.includes("outline-width")) {
    return isValid(validate(getCSSText("outline-width", input), ""));
  }

  if (
    tokenPath.includes("outline") &&
    tokenPath
      .split("-")
      .some((tok) => ["top", "right", "bottom", "left"].includes(tok))
  ) {
    return isValid(validate(getCSSText("outline-top", input), ""));
  }

  if (tokenPath.includes("outline-style")) {
    return isValid(validate(getCSSText("outline-style", input), ""));
  }

  if (tokenPath.includes("cursor")) {
    return isValid(validate(getCSSText("cursor", input), ""));
  }

  if (tokenPath.includes("opacity")) {
    return isValid(validate(getCSSText("opacity", input), ""));
  }

  // Need to know here if % etc should be included for a 'size'/'spacing' foundation property
  if (
    tokenPath.includes("typography-size") ||
    ((tokenPath.includes("size") || tokenPath.includes("spacing")) &&
      tokenPath
        .split("-")
        .some((tok) =>
          ["small", "medium", "large", "high", "low", "touch", "unit"].includes(
            tok
          )
        ))
  ) {
    return (
      input.endsWith("px") &&
      isValid(validate(getCSSText("font-size", input), ""))
    );
  }

  // if (tokenPath.includes('shadow')) {
  //     return isValid(validate(getCSSText("shadow", input), ''));
  // }

  return true;
}
