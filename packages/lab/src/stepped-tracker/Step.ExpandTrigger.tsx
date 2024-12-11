import { Button, type ButtonProps } from "@salt-ds/core";
import { makePrefixer } from "@salt-ds/core";
import { useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";

import stepExpandTriggerCSS from "./Step.ExpandTrigger.css";

export namespace StepExpandTrigger {
  export interface Props extends ButtonProps {
    expanded: boolean;
  }
}

const withBaseName = makePrefixer("saltStepExpandTrigger");

export function StepExpandTrigger({
  expanded,
  className,
  ...props
}: StepExpandTrigger.Props) {
  const { CollapseIcon, ExpandIcon } = useIcon();
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-expand-trigger",
    css: stepExpandTriggerCSS,
    window: targetWindow,
  });

  return (
    <Button
      appearance="transparent"
      sentiment="neutral"
      className={clsx(withBaseName(), className)}
      {...props}
    >
      {expanded ? <CollapseIcon aria-hidden /> : <ExpandIcon aria-hidden />}
    </Button>
  );
}
