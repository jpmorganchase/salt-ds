import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";

import { Text, type TextProps } from "../../text";
import { makePrefixer } from "../../utils";
import stepTextCSS from "./StepText.css";

export interface StepTextProps extends TextProps<"div"> {
  purpose: "label" | "description";
}

const withBaseName = makePrefixer("saltStepText");

export function StepText({
  id,
  purpose,
  className,
  styleAs = "label",
  children,
  ...props
}: StepTextProps) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-text",
    css: stepTextCSS,
    window: targetWindow,
  });

  return (
    <Text
      id={id}
      styleAs="label"
      className={clsx(withBaseName(), withBaseName(purpose), className)}
      {...props}
    >
      {children}
    </Text>
  );
}
