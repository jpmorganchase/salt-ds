import React, { useContext } from 'react';
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
import { makePrefixer } from '@salt-ds/core';
import { useComponentCssInjection } from '@salt-ds/styles';
import { useWindow } from '@salt-ds/window';

import stepIconCSS from './StepIcon.css'

import { type Step } from './Step';
import { StepDepthContext } from './StepDepthContext';

export namespace StepIcon {
  export interface Props extends IconProps {
    stage: Step.Props['stage']
    status: Step.Props['status']
    multiplier?: IconProps['size']
  }
}

const withBaseName = makePrefixer('saltStepIcon')

export function StepIcon({
  status,
  stage,
  className,
  multiplier = 1.5,
  size,
  ...props
}: StepIcon.Props) {
  const depth = useContext(StepDepthContext);

  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: 'salt-step-icon',
    css: stepIconCSS,
    window: targetWindow
  })

  const Component = stateToComponent({ status, stage })

  return (
    <Component
      className={clsx(
        withBaseName(),
        className,
      )}
      size={multiplier}
      {...props}
    />
  )
  
}

function stateToComponent(props: Partial<StepIcon.Props>) {
  const { stage, status } = props;
  
  if(stage === 'completed') {
    return StepSuccessIcon;
  }

  if(stage === 'active') {
    return StepActiveIcon;
  }
 
  if(status === 'error') {
    return ErrorSolidIcon;
  }

  if(status === 'warning') {
    return WarningSolidIcon;
  }

  if(stage === 'inprogress') {
    return ProgressInprogressIcon;
  }

  return StepDefaultIcon;
}