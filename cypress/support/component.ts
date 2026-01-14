import "cypress-real-events";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as globalStorybookConfig from "../../.storybook/preview"; // path of your preview.js file
import "./assertions";
import "./commands";
import "./cypress.css";

setProjectAnnotations(globalStorybookConfig);

beforeEach(() => {
  // Focus to viewport and reset mouse position before every test.
  cy.window({ log: false }).focus({ log: false });
  cy.get("body", { log: false }).realHover({ position: "topLeft" });
});
