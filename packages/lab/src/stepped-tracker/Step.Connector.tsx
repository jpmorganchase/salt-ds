import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepConnectorCSS from "./Step.Connector.css";

const withBaseName = makePrefixer("saltStepConnector");

export function StepConnector() {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-connector",
    css: stepConnectorCSS,
    window: targetWindow,
  });

  return <div aria-hidden className={withBaseName()} />;
}
