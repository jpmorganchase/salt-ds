import { makePrefixer, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { getPercentage } from "./utils";
import { ComponentPropsWithoutRef, RefObject, useState } from "react";
import { useMouseDownThumb } from "./useMouseDownThumb";
import { useKeyDownThumb } from "./useKeyDownThumb";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  trackRef: RefObject<HTMLDivElement>;
  value: number;
  index: number;
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { trackRef, index, ...rest } = props;

  const { min, max, step, value, setValue, onChange, ariaLabel } =
    useSliderContext();

  const onKeyDown = useKeyDownThumb(
    min,
    max,
    step,
    value,
    setValue,
    onChange,
    index
  );

  const { thumbProps, thumbFocus } = useMouseDownThumb(
    trackRef,
    min,
    max,
    step,
    value,
    setValue,
    onChange,
    index
  );

  const percentage = Array.isArray(value)
    ? index
      ? getPercentage(min, max, value[0])
      : getPercentage(min, max, value[1])
    : getPercentage(min, max, value);

  return (
    <div
      style={{ left: `${percentage}` }}
      className={withBaseName("container")}
      {...thumbProps}
    >
      <div
        className={clsx(withBaseName("tooltip"), {
          [withBaseName("showTooltip")]: !thumbFocus,
        })}
        aria-expanded={thumbFocus}
      >
        {Array.isArray(value) && <Label>{index ? value[0] : value[1]}</Label>}
        {!Array.isArray(value) && <Label>{value}</Label>}
      </div>
      <div
        className={withBaseName()}
        onKeyDown={onKeyDown}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        tabIndex={0}
        {...rest}
      />
    </div>
  );
}
