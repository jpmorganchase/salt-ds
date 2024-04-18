import { makePrefixer, Tooltip } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  CSSProperties,
  ComponentPropsWithoutRef,
  ReactNode,
  useMemo,
} from "react";
// import { getSliderAriaLabel } from "../utils";
import { createTrackStyle } from "./styles";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderThumbCss from "./SliderThumb.css";

const withBaseName = makePrefixer("saltSliderThumb");

export interface slilderThumbProps {
  min: number;
  max: number;
  value: number;
  disabled?: boolean;
  index?: number;
}

export function SliderThumb(props: slilderThumbProps): JSX.Element {
  const { min, max, value, disabled, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    css: sliderThumbCss,
    window: targetWindow,
  });

  return (
    <Tooltip content={value} status={"info"} hideIcon placement="top">
      <div
        className={withBaseName()}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        // aria-label={getSliderAriaLabel(valueLength, index)}
        tabIndex={0}
        // data-handle-index={index}
        {...rest}
      />
    </Tooltip>
  );
}
