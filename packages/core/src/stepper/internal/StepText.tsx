import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";

import { Text, type TextProps } from "../../text";
import { makePrefixer } from "../../utils";
import stepTextCSS from "./StepText.css";

export interface StepTextProps extends TextProps<"div"> {
  /**
   * The purpose of the text, which sets its area in the step's layout:
   * `"label"` for the step's label, or `"description"` for the text below the
   * label. For a description, `styleAs` defaults to `"label"` and `color` to
   * `"secondary"`.
   */
  purpose: "label" | "description";
}

const withBaseName = makePrefixer("saltStepText");

export function StepText({
  id,
  purpose,
  className,
  styleAs = purpose === "description" ? "label" : undefined,
  color = purpose === "description" ? "secondary" : undefined,
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
      styleAs={styleAs}
      color={color}
      className={clsx(withBaseName(), withBaseName(purpose), className)}
      {...props}
    >
      {children}
    </Text>
  );
}
