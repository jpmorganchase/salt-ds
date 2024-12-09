import { makePrefixer, useIcon } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { useMemo } from "react";

import type { Step } from "./Step";
import stepIconCSS from "./Step.Icon.css";

export namespace StepIcon {
  export interface Props extends IconProps {
    stage: Step.Stage;
    status?: Step.Status;
    sizeMultiplier?: IconProps["size"];
  }
}

const withBaseName = makePrefixer("saltStepIcon");

export function StepIcon({
  status,
  stage,
  size,
  sizeMultiplier = size || 1.5,
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

  return (
    <IconComponent
      size={sizeMultiplier}
      aria-hidden
      aria-label={undefined}
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
