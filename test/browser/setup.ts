import { setProjectAnnotations } from "@storybook/react-vite";
import { version as reactVersion } from "react";
import { afterEach, beforeEach } from "vitest";
import { cdp } from "vitest/browser";
import * as globalStorybookConfig from "../../.storybook/preview";
import "./browser.css";

setProjectAnnotations(globalStorybookConfig);

// From React 18, Strict Mode re-runs effects (and from React 19, ref callbacks)
// in development, to surface code that doesn't cope with being remounted. The
// React 16 and 17 renderer is only imported by the tests that use it.
if (Number.parseInt(reactVersion, 10) >= 18) {
  const { configure } = await import("vitest-browser-react/pure");
  configure({ reactStrictMode: true });
}

// React warns about APIs that are deprecated or that behave differently in
// other major versions. Failing on these keeps every supported version working.
const reactCompatibilityWarnings = [
  /is being spread into JSX/,
  /Accessing element\.ref/,
  /Support for defaultProps will be removed/,
  /findDOMNode is deprecated/,
  /ReactDOM\.(render|hydrate) is no longer supported/,
  /unmountComponentAtNode is deprecated/,
  /string ref/i,
  /legacy context/i,
  /componentWill(Mount|ReceiveProps|Update) has been renamed/,
  /Function components cannot be given refs/,
  /`ref` is not a prop/,
];

// Warnings from third-party components that can't be changed: react-color's
// SketchPicker, used by the lab ColorChooser, still uses defaultProps. Matched by
// component name, as pre-bundled dependencies don't keep their file names.
const allowedWarnings = [
  /\b(?:Checkboard|Sketch): Support for defaultProps will be removed from function components/,
];

function formatConsoleMessage([message, ...args]: unknown[]) {
  if (typeof message !== "string") {
    return [message, ...args].map(String).join(" ");
  }
  // Substitute printf-style placeholders, as React passes component names as arguments.
  return message.replace(/%[sdifoOc]/g, () => String(args.shift() ?? ""));
}

const compatibilityWarnings: string[] = [];
for (const method of ["error", "warn"] as const) {
  const original = console[method].bind(console);
  console[method] = (...args: unknown[]) => {
    const message = formatConsoleMessage(args);
    if (
      reactCompatibilityWarnings.some((pattern) => pattern.test(message)) &&
      !allowedWarnings.some((pattern) => pattern.test(message))
    ) {
      compatibilityWarnings.push(message);
    }
    original(...args);
  };
}

afterEach(() => {
  const warnings = compatibilityWarnings.splice(0);
  if (warnings.length > 0) {
    throw new Error(
      `React compatibility warnings were logged:\n\n${warnings.join("\n\n")}`,
    );
  }
});

beforeEach(async () => {
  window.focus();
  // Vitest's unhover parks the pointer in the middle of the body, where Salt's
  // centered test content can mount underneath it and inherit hover state. The
  // browser matrix is Chromium-only, so move the real pointer through CDP
  // without adding a DOM target that focus/inert logic can interfere with.
  await (
    cdp() as {
      send(method: string, params: Record<string, unknown>): Promise<unknown>;
    }
  ).send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: 4,
    y: 4,
  });
});
