import "cypress-real-events/support";
// import "@cypress/code-coverage/support";
import { setGlobalConfig } from "@storybook/testing-react";
import * as globalStorybookConfig from "../../.storybook/preview"; // path of your preview.js file
import "./assertions";
import "./commands";

setGlobalConfig(globalStorybookConfig);
