import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useIcon } from "../../semantic-icon-provider";
import { makePrefixer } from "../../utils";
import type { StepStage, StepStatus } from "../Step";
import stepIconCSS from "./StepIcon.css";

export interface StepIconProps extends IconProps {
  /**
   * The stage of the step, which sets the icon when `status` isn't set.
   */
  stage: StepStage;
  /**
   * The status of the step. When set, it replaces the stage's icon with the
   * warning or error icon.
   */
  status?: StepStatus;
  /**
   * The size of the icon, as a multiplier of the base icon size. It takes
   * precedence over `size`. When `size` is set, it defaults to `size`.
   * @default 1.5
   */
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

  const stateToIcon = useMemo(
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

  return stateToIcon[status || stage];
}
