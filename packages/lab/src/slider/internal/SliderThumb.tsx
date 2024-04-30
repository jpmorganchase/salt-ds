import { makePrefixer, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { getPercentage } from "./utils";
import { ComponentPropsWithoutRef, RefObject } from "react";
import { useMouseDownThumb } from "./useMouseDownThumb";
import { useKeyDownThumb } from "./useKeyDownThumb";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  trackRef: RefObject<HTMLDivElement>;
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { trackRef, className, ...rest } = props;

  const { min, max, step, value, setValue, onChange, ariaLabel } =
    useSliderContext();

  const onKeyDown = useKeyDownThumb(min, max, step, value, setValue, onChange);

  const { thumbProps, thumbFocus } = useMouseDownThumb(
    trackRef,
    min,
    max,
    step,
    value,
    setValue,
    onChange
  );

  const percentage = getPercentage(min, max, value);

  return (
    <div
      style={{ left: `${percentage}` }}
      className={withBaseName("container")}
    >
      <div
        className={clsx(withBaseName("tooltip"), {
          [withBaseName("showTooltip")]: !thumbFocus,
        })}
      >
        <Label>{value}</Label>
        {/* <div className={withBaseName("arrow")} /> */}
      </div>
      <div className={withBaseName("selectionArea")} {...thumbProps}>
        <div
          className={clsx(withBaseName(), className)}
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
    </div>
  );
}
