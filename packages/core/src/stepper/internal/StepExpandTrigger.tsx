import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { Button, type ButtonProps } from "../../button";
import { useIcon } from "../../semantic-icon-provider";
import { makePrefixer } from "../../utils";

import stepExpandTriggerCSS from "./StepExpandTrigger.css";

export interface StepExpandTriggerProps extends ButtonProps {
  expanded: boolean;
}

const withBaseName = makePrefixer("saltStepExpandTrigger");

export function StepExpandTrigger({
  id,
  expanded,
  className,
  ...props
}: StepExpandTriggerProps) {
  const { CollapseIcon, ExpandIcon } = useIcon();
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-expand-trigger",
    css: stepExpandTriggerCSS,
    window: targetWindow,
  });

  return (
    <Button
      id={id}
      sentiment="neutral"
      appearance="transparent"
      className={clsx(withBaseName(), className)}
      {...props}
    >
      {expanded ? <CollapseIcon aria-hidden /> : <ExpandIcon aria-hidden />}
    </Button>
  );
}
