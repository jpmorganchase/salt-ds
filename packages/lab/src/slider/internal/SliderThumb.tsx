import { makePrefixer, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { getPercentage } from "./utils";
import { ComponentPropsWithoutRef, RefObject } from "react";
import { usePointerDownThumb } from "./usePointerDownThumb";
import { useKeyDownThumb } from "./useKeyDownThumb";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  trackRef: RefObject<HTMLDivElement>;
  index: number;
  activeThumb: number | undefined;
  setActiveThumb: (index: number | undefined) => void;
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { trackRef, index, activeThumb, setActiveThumb, ...rest } = props;

  const { min, max, step, value, onChange, ariaLabel } = useSliderContext();

  const onKeyDown = useKeyDownThumb(min, max, step, value, onChange, index);

  const { thumbProps } = usePointerDownThumb(
    trackRef,
    min,
    max,
    step,
    value,
    onChange,
    index,
    activeThumb,
    setActiveThumb
  );

  const percentage = Array.isArray(value)
    ? index
      ? getPercentage(min, max, value[1])
      : getPercentage(min, max, value[0])
    : getPercentage(min, max, value);

  console.log({ activeThumb });
  console.log({ index });

  return (
    <div
      style={{ left: `${percentage}` }}
      className={withBaseName("container")}
      {...thumbProps}
    >
      <div
        className={clsx(withBaseName("tooltip"), {
          [withBaseName("showTooltip")]: activeThumb === index,
        })}
        aria-expanded={activeThumb === index ? true : false}
      >
        {Array.isArray(value) && <Label>{index ? value[1] : value[0]}</Label>}
        {!Array.isArray(value) && <Label>{value}</Label>}
      </div>
      <div
        className={withBaseName()}
        onKeyDown={onKeyDown}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={
          Array.isArray(value) ? (index === 0 ? value[0] : value[1]) : value
        }
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        tabIndex={0}
        {...rest}
      />
    </div>
  );
}
