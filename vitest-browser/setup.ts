import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeEach } from "vitest";
import { userEvent } from "vitest/browser";
import * as globalStorybookConfig from "../.storybook/preview";
import "./browser.css";

setProjectAnnotations(globalStorybookConfig);

beforeEach(async () => {
  window.focus();
  await userEvent.unhover(document.body);
});
