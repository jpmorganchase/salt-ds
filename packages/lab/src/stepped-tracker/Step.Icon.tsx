import { makePrefixer, useIcon } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { useMemo } from "react";

import stepIconCSS from "./Step.Icon.css";

import type { StepStage, StepStatus } from "./Step.types";

export interface StepIconProps extends IconProps {
  stage: StepStage;
  status?: StepStatus;
  sizeMultiplier?: IconProps["size"];
}

const withBaseName = makePrefixer("saltStepIcon");

export function StepIcon({
  status,
  stage,
  size,
  sizeMultiplier = size || 1.5,
  className,
  ...props
}: StepIconProps) {
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
      className={clsx(withBaseName(), className)}
      {...props}
    />
  );
}

function useStepIcon({
  stage,
  status,
}: Pick<StepIconProps, "stage" | "status">) {
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
