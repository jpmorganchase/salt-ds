import { Text, type TextProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";

import stepLabelCSS from "./Step.Label.css";

export namespace StepLabel {
  export interface Props extends TextProps<"div"> {
    id: string;
  }
}

const withBaseName = makePrefixer("saltStepLabel");

export function StepLabel({
  id,
  className,
  styleAs = "label",
  ...props
}: StepLabel.Props) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-label",
    css: stepLabelCSS,
    window: targetWindow,
  });

  return (
    <Text
      id={id}
      styleAs="label"
      className={clsx(withBaseName(), className)}
      {...props}
    />
  );
}
