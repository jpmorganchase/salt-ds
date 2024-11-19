import clsx from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepTrackCSS from "./Step.Connector.css";

export namespace StepConnector {
  export interface Props {
    className?: string;
  }
}

const withBaseName = makePrefixer("saltStepConnector");

export function StepConnector({ className }: StepConnector.Props) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-track",
    css: stepTrackCSS,
    window: targetWindow,
  });

  return <div className={clsx(withBaseName(), className)} />;
}
