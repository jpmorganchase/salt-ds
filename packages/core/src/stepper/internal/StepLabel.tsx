import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { Text, type TextProps } from "../../text";
import { makePrefixer } from "../../utils";

import stepLabelCSS from "./StepLabel.css";

export interface StepLabelProps extends TextProps<"div"> {}

const withBaseName = makePrefixer("saltStepLabel");

export function StepLabel({
  id,
  className,
  styleAs = "label",
  children,
  ...props
}: StepLabelProps) {
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
    >
      {children}
    </Text>
  );
}
