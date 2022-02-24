import { CSSProperties, HTMLAttributes } from "react";
import { makePrefixer } from "@brandname/core";
import cn from "classnames";
import { getSliderAriaLabel } from "./utils";
import { Tooltip } from "../../tooltip";
import { PopperProps } from "../../popper";
import "../Slider.css";

const withBaseName = makePrefixer("uitkSliderHandle");

export interface SliderHandleProps {
  min: number;
  max: number;
  value: number;
  index: number;
  disabled: boolean;
  valueLength: number;
  style: CSSProperties;
  popperProps: PopperProps;
}

export function SliderHandle(props: SliderHandleProps) {
  const { min, max, value, disabled, valueLength, index, popperProps, style } =
    props;

  const ariaAttributes: HTMLAttributes<HTMLDivElement> = {
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-disabled": disabled,
    "aria-label": getSliderAriaLabel(valueLength, index),
  };

  return (
    <div
      key={index}
      className={cn(withBaseName(), {
        [withBaseName("min")]: value === min,
        [withBaseName("max")]: value === max,
      })}
      style={style}
      role="slider"
      data-handle-index={index}
      {...ariaAttributes}
    >
      <Tooltip placement="top" title={`${value}`} PopperProps={popperProps}>
        <div className={cn(withBaseName("box"))} tabIndex={0} />
      </Tooltip>
    </div>
  );
}
