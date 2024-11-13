import React, { 
  ComponentProps,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode, 
} from 'react';
import clsx from 'clsx';
import { useWindow } from '@salt-ds/window';
import { Text, Button, makePrefixer } from '@salt-ds/core';
import { useComponentCssInjection } from "@salt-ds/styles"

import {
  StepDepthContext,
  StepDepthProvider
} from './StepDepthContext';
import stepCSS from './Step.css';

import { StepTrack } from './StepTrack';
import { StepIcon } from './StepIcon';
import { StepExpandTrigger } from './StepExpandTrigger';

export namespace Step {
  export interface Props extends ComponentProps<'li'> {
    label?: ReactNode
    description?: ReactNode
    stage?: Stage
    status?: Status
    disabled?: boolean
    className?: string
    style?: CSSProperties
    children?: ReactNode
  }

  export type Stage = 
    | "pending"
    | "completed"
    | "inprogress"
    | "active"

  export type Status = 
    | "warning"
    | "error"

  export type Depth = number;
}

const withBaseName = makePrefixer('saltStep')

// TODO: Add clickability
// TODO: Add locked state
export function Step({
  label,
  description,
  stage = "pending",
  status,
  className,
  style,
  children,
  ...props
}: Step.Props) {
  const depth = useContext(StepDepthContext);
  const [expanded, setExpanded] = useState(true);
  const targetWindow = useWindow();

  const hasNestedSteps = !!children;

  useComponentCssInjection({
    testId: 'salt-step',
    css: stepCSS,
    window: targetWindow
  })

  const iconMultiplier = depth === 0 ? 1.5 : 1;

  return (
    <StepDepthProvider value={depth + 1}>
      <li
        className={clsx(
          withBaseName(),
          status && withBaseName(`status-${status}`),
          stage && withBaseName(`stage-${stage}`),
          expanded && withBaseName('expanded'),
          className
        )}
        style={{
          '--depth': depth,
          ...style
        } as CSSProperties}
        {...props}
      >
        <StepTrack />
        <StepIcon
          stage={stage}
          status={status}
          multiplier={iconMultiplier}
        />
        {label && (
          <Text className={withBaseName('label')}>
            <strong>{label}</strong>
          </Text>
        )}
        {description && (
          <Text styleAs="label" className={withBaseName('description')}>
            {description}
          </Text>
        )}
        {children && (
          <StepExpandTrigger
            label={"Show Substeps"}
            expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          />
        )}
        {children && (
          <ol>{children}</ol>
        )}
      </li>
    </StepDepthProvider>
  )
}

