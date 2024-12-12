import { Text, type TextProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";

import stepDescriptionCSS from "./Step.Description.css";

export interface StepDescriptionProps extends TextProps<"div"> {}

const withBaseName = makePrefixer("saltStepDescription");

export function StepDescription({
  id,
  className,
  styleAs = "label",
  ...props
}: StepDescriptionProps) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-description",
    css: stepDescriptionCSS,
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
