import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeEach } from "vitest";
import { cdp } from "vitest/browser";
import * as globalStorybookConfig from "../../.storybook/preview";
import "./browser.css";

setProjectAnnotations(globalStorybookConfig);

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
