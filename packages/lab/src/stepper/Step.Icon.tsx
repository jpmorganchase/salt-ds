import clsx from "clsx";
import { useMemo } from "react";
import { makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { IconProps } from "@salt-ds/icons";

import stepIconCSS from "./Step.Icon.css";
import type { Step } from "./Step";

export namespace StepIcon {
  export interface Props extends IconProps {
    stage: Step.Stage;
    status?: Step.Status;
    multiplier?: IconProps["size"];
  }
}

const withBaseName = makePrefixer("saltStepIcon");

export function StepIcon({
  status,
  stage,
  size,
  multiplier = size || 1.5,
  className,
  ...props
}: StepIcon.Props) {
  const targetWindow = useWindow();
  const IconComponent = useStepIcon({ stage, status });

  useComponentCssInjection({
    testId: "salt-step-icon",
    css: stepIconCSS,
    window: targetWindow,
  });

  const ariaLabel = `${status || stage}`;

  return (
    <IconComponent
      size={multiplier}
      aria-label={ariaLabel}
      className={clsx(withBaseName(), className)}
      {...props}
    />
  );
}

export function useStepIcon({
  stage,
  status,
}: Pick<StepIcon.Props, "stage" | "status">) {
  const icons = useIcon();

  const stepIconMap = useMemo(
    () => ({
      error: icons.ErrorIcon,
      warning: icons.WarningIcon,
      active: icons.ActiveIcon,
      completed: icons.CompletedIcon,
      pending: icons.PendingIcon,
      inprogress: icons.InProgressIcon,
      locked: icons.LockedIcon,
    }),
    [icons],
  );

  return stepIconMap[status || stage];
}
