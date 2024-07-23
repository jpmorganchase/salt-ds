import { Label, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useState } from "react";
import { useSliderContext } from "./SliderContext";
import { useKeyDownThumb } from "./useKeyDownThumb";
import { getPercentage } from "./utils";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  index: number;
  activeThumb: number | undefined;
  setActiveThumb: (index: number | undefined) => void;
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { index, activeThumb, setActiveThumb } = props;

  const [focussed, setFocussed] = useState(false);

  const { min, max, step, value, onChange, ariaLabel } = useSliderContext();

  const onKeyDown = useKeyDownThumb(min, max, step, value, onChange, index);

  const thumbPosition = getPercentage(min, max, value[index]);

  const handlePointerOver = () => {
    if (activeThumb === undefined && index !== null) setActiveThumb(index);
  };

  const handleFocus = () => {
    setFocussed(true);
    if (index !== null) setActiveThumb(index);
  };

  const handleBlur = () => {
    setFocussed(false);
    setActiveThumb(undefined);
  };

  const showTooltip = focussed || activeThumb === index;

  return (
    <div
      style={{ left: `${thumbPosition}%` }}
      className={withBaseName("container")}
      onPointerOver={handlePointerOver}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        className={clsx(withBaseName("tooltip"), {
          [withBaseName("tooltip-visible")]: showTooltip,
        })}
        aria-expanded={showTooltip}
      >
        <svg
          className={withBaseName("tooltip-arrow")}
          aria-hidden="true"
          viewBox="0 1 14 14"
        >
          <path d="M0,0 H14 L7,7 Q7,7 7,7 Z" />
        </svg>
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
      />
    </div>
  );
}
