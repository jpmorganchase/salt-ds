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

  /**
   * noun: elucidation; pl. noun: elucidations
   * explanation that makes something clear; 🤔
   */
  export type Elucidation = Step.Status | Step.Stage;
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

  const elucidation: StepLabel.Elucidation = status || stage;
  const elucidationId = `${id}-elucidation`;

  return (
    <Text
      id={id}
      styleAs="label"
      className={clsx(withBaseName(), className)}
      {...props}
    >
      {children}
      {elucidation && elucidation !== "active" && (
        <span id={elucidationId} className={withBaseName("elucidation")}>
          {elucidation}
        </span>
      )}
    </Text>
  );
}
