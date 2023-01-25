import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { CSSProperties } from "react";
import { getSliderAriaLabel } from "./utils";
import { Tooltip } from "../../tooltip";

import "../Slider.css";

const withBaseName = makePrefixer("saltSliderHandle");

export interface SliderHandleProps {
  min: number;
  max: number;
  value: number;
  index: number;
  disabled: boolean;
  valueLength: number;
  style: CSSProperties;
}

export function SliderHandle(props: SliderHandleProps): JSX.Element {
  const { min, max, value, disabled, valueLength, index, style } = props;

  return (
    <Tooltip content={value} placement="top">
      <div
        className={clsx(withBaseName(), {
          [withBaseName("min")]: value === min,
          [withBaseName("max")]: value === max,
        })}
        style={style}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        aria-label={getSliderAriaLabel(valueLength, index)}
        tabIndex={0}
        data-handle-index={index}
      />
    </Tooltip>
  );
}
