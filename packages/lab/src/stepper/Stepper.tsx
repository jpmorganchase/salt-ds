import React, { ComponentProps, forwardRef, type ReactNode } from "react";
import { clsx } from "clsx";

import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepperCSS from './Stepper.css';

export namespace Stepper {
  export interface Props extends ComponentProps<'ol'> {
    orientation?: Orientation
    className?: string
    children: ReactNode
  }

  export type Orientation =
    | 'horizontal'
    | 'vertical'
}

export interface StepperProps extends Stepper.Props {}

const withBaseName= makePrefixer('saltStepper')

export const Stepper = forwardRef<HTMLOListElement, Stepper.Props>(
  function Stepper(
    {
    orientation = 'horizontal',
    className = '',
    children,
    ...props
  },
  ref
) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: 'salt-stepper',
    css: stepperCSS,
    window: targetWindow
  })

    return (
      <ol
        className={clsx(
          withBaseName(),
          withBaseName(orientation),
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </ol>
    )
  }
)
