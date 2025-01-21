import { makePrefixer } from "@salt-ds/core";
import clsx from "clsx";
import {
  type ChangeEvent,
  type HTMLAttributes,
  forwardRef,
  useRef,
  useState,
} from "react";
import { SliderTooltip } from "./SliderTooltip";

const withBaseName = makePrefixer("saltSliderThumb");

interface SliderThumbProps
  extends Omit<
    HTMLAttributes<HTMLInputElement>,
    "onChange" | "defaultValue" | "min" | "max"
  > {
  disabled: boolean;
  format?: (value: number) => number | string;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  index?: number;
  min: number;
  max: number;
  offsetPercentage?: string;
  onChange: (event: MouseEvent | React.MouseEvent) => void;
  step: number;
  thumbValue: [number, number] | number;
  trackDragging: boolean;
}

export const SliderThumb = forwardRef<HTMLInputElement, SliderThumbProps>(
  function SliderThumb(
    {
      "aria-label": ariaLabel,
      "aria-valuetext": ariaValueText,
      "aria-labelledby": ariaLabelledBy,
      disabled,
      format,
      handleInputChange,
      handleMouseDown,
      index = 0,
      min,
      max,
      offsetPercentage,
      onChange,
      step,
      thumbValue,
      trackDragging,
      ...rest
    },
    ref,
  ) {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleMouseEnter = () => setTooltipVisible(true);

    const handleMouseLeave = () => setTooltipVisible(false);

    const handleFocus = () => {
      // We add focus to the input to get the keyboard
      // interactions for the slider out of the box.
      if (inputRef.current) inputRef.current.focus();

      setIsFocused(true);
      setTooltipVisible(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      setTooltipVisible(false);
    };

    const value = Array.isArray(thumbValue) ? thumbValue[index] : thumbValue;
    const formattedValue = format ? format(value) : value;

    return (
      <div
        className={clsx(withBaseName(), {
          [withBaseName("focused")]: isFocused,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        style={{ left: offsetPercentage }}
        ref={ref}
      >
        {(tooltipVisible || trackDragging) && !disabled && (
          <SliderTooltip value={formattedValue} />
        )}
        <input
          disabled={disabled}
          type="range"
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={withBaseName("input")}
          value={value}
          onChange={handleInputChange}
          aria-labelledby={ariaLabelledBy}
          aria-valuenow={value}
          aria-valuetext={ariaValueText}
          aria-label={ariaLabel}
          min={min}
          max={max}
          step={step}
          {...rest}
        />
      </div>
    );
  },
);
