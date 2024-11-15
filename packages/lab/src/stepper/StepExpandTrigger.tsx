import React from "react";
import clsx from "clsx";
import { Button, type ButtonProps } from "@salt-ds/core";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepExpandTriggerCSS from "./StepExpandTrigger.css";

export namespace StepExpandTrigger {
  export interface Props extends ButtonProps {
    label: string;
    expanded: boolean;
  }
}

const withBaseName = makePrefixer("saltStepExpandTrigger");

export function StepExpandTrigger({
  label,
  expanded,
  className,
  ...props
}: StepExpandTrigger.Props) {
  const targetWindow = useWindow();

  // TODO: Figure out what's correct
  const ariaLabel = `Step ${label} show sub steps`;

  useComponentCssInjection({
    testId: "salt-step-expand-trigger",
    css: stepExpandTriggerCSS,
    window: targetWindow,
  });

  return (
    <Button
      appearance="transparent"
      sentiment="neutral"
      aria-expanded={expanded}
      aria-label={ariaLabel}
      className={clsx(withBaseName(), className)}
      {...props}
    >
      {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </Button>
  );
}
