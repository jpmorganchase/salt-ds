import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import clsx from "clsx";
import {
  ErrorSolidIcon,
  ProgressInprogressIcon,
  StepActiveIcon,
  StepDefaultIcon,
  StepSuccessIcon,
  WarningSolidIcon,
  type IconProps,
} from "@salt-ds/icons";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepIconCSS from "./Step.Icon.css";
import type { Step } from "./Step";

export namespace StepIcon {
  export interface Props extends IconProps {
    stage: Step.Stage;
    status?: Step.Status;
    multiplier?: IconProps["size"];
    element?: ReactElement;
  }
}

const withBaseName = makePrefixer("saltStepIcon");

export function StepIcon({
  status,
  stage,
  size,
  multiplier = size || 1.5,
  element = stateToIconMap[status || stage],
  className,
  ...props
}: StepIcon.Props) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-icon",
    css: stepIconCSS,
    window: targetWindow,
  });

  const ariaLabel = `${status || stage}: `;

  return cloneElement(element, {
    size: multiplier,
    className: clsx(
      withBaseName(),
      className
    ),
    'aria-label': ariaLabel,
    ...props,
    ...element.props,
  })
}

const stateToIconMap = {
  completed: <StepSuccessIcon />,
  inprogress: <ProgressInprogressIcon />,
  active: <StepActiveIcon />,
  error: <ErrorSolidIcon />,
  warning: <WarningSolidIcon />,
  pending: <StepDefaultIcon />,
} satisfies Record<Step.Stage | Step.Status, ReactElement>
