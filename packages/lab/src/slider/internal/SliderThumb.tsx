import { makePrefixer, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { getPercentage } from "./utils";
import { ComponentPropsWithoutRef, RefObject } from "react";
import { useMouseThumbDown } from "./useMouseThumbDown";
import { useSliderKeyDown } from "./useSliderKeyDown";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  trackRef: RefObject<HTMLDivElement>;
  disabled?: boolean;
  index?: number;
  tooltipPlacement?: "left" | "right" | "top" | "bottom";
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { trackRef, className, ...rest } = props;

  const { min, max, step, value, setValue, onChange } = useSliderContext();

  const onKeyDown = useSliderKeyDown(min, max, step, value, setValue, onChange);

  const { thumbProps, thumbFocus } = useMouseThumbDown(
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
        <Label> {value} </Label>
      </div>
      <div className={withBaseName("selectionArea")} {...thumbProps}>
        <div
          className={clsx(withBaseName(), className)}
          onKeyDown={onKeyDown}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation="horizontal"
          tabIndex={0}
          {...rest}
        />
      </div>
    </div>
  );
}
