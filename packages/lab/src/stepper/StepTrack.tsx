import React from 'react';
import clsx from 'clsx';
import { makePrefixer } from '@salt-ds/core';
import { useComponentCssInjection } from '@salt-ds/styles';
import { useWindow } from '@salt-ds/window';

import stepTrackCSS from './StepTrack.css';

export namespace StepTrack {
  export interface Props {
    className?: string
  }
}

const withBaseName = makePrefixer('saltStepTrack')

export function StepTrack() {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: 'salt-step-track',
    css: stepTrackCSS,
    window: targetWindow
  })
  
  return (
    <div
      className={clsx(
        withBaseName(),
      )}
    />
  )
}
