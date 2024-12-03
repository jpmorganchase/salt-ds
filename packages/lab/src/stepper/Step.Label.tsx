import { Text, type TextProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";

import type { Step } from "./Step";
import stepLabelCSS from "./Step.Label.css";

export namespace StepLabel {
  export interface Props extends TextProps<"div"> {
    id: string;
    stage: Step.Stage;
    status?: Step.Status;
  }
}

const withBaseName = makePrefixer("saltStepLabel");

export function StepLabel({
  id,
  stage,
  status,
  className,
  styleAs = "label",
  children,
  ...props
}: StepLabel.Props) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-label",
    css: stepLabelCSS,
    window: targetWindow,
  });

  /**
   * noun: elucidation; pl. noun: elucidations
   * explanation that makes something clear; 😜
   */
  const elucidation: Step.Elucidation =
    status ?? (stage !== "active" ? stage : null);

  return (
    <Text
      id={id}
      styleAs="label"
      className={clsx(withBaseName(), className)}
      {...props}
    >
      {children}
      {elucidation && (
        <span className={withBaseName("elucidation")}>{elucidation}</span>
      )}
    </Text>
  );
}
