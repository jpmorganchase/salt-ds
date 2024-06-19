import { makePrefixer, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { getPercentage } from "./utils";
import { ComponentPropsWithoutRef, RefObject } from "react";
import { usePointerDown } from "./usePointerDown";
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

  const { thumbProps } = usePointerDown(
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

  const thumbPosition = getPercentage(min, max, value[index]);

  return (
    <div
      style={{ left: `${thumbPosition}%` }}
      className={withBaseName("container")}
      {...thumbProps}
    >
      <div
        className={clsx(withBaseName("tooltip"), {
          [withBaseName("showTooltip")]: activeThumb === index,
        })}
        aria-expanded={activeThumb === index}
      >
        <Label>{value[index]}</Label>
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
