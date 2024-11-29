import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";

import stepConnectorCSS from "./Step.Connector.css";

export namespace StepConnector {
  export interface Props {
    className?: string;
  }
}

const withBaseName = makePrefixer("saltStepConnector");

export function StepConnector({ className }: StepConnector.Props) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-connector",
    css: stepConnectorCSS,
    window: targetWindow,
  });

  return <div className={clsx(withBaseName(), className)} />;
}
