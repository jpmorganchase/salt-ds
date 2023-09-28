import "cypress-real-events";
import "@cypress/code-coverage/support";
import { setProjectAnnotations } from "@storybook/react";
import * as globalStorybookConfig from "../../.storybook/preview"; // path of your preview.js file
import "./assertions";
import "./commands";
import "./cypress.css";

// TODO remove when https://github.com/cypress-io/cypress/issues/21434 is fixed
global.process = global.process || {};
global.process.env = global.process.env || {};

setProjectAnnotations(globalStorybookConfig);

beforeEach(() => {
  cy.window({ log: false }).focus({ log: false });
});
