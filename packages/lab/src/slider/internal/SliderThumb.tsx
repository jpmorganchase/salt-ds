import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ChangeEvent,
  type HTMLAttributes,
  forwardRef,
  useEffect,
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
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const targetWindow = useWindow();

    useEffect(() => {
      if (isTooltipVisible) {
        targetWindow?.addEventListener("keydown", handleKeyDown);
      }
      return () => targetWindow?.removeEventListener("keydown", handleKeyDown);
    }, [targetWindow, isTooltipVisible]);

    const handleMouseEnter = () => setIsTooltipVisible(true);

    const handleMouseLeave = () => {
      // Delay hiding the tooltip to enable tooltip
      // visibility on hover
      setTimeout(() => {
        setIsTooltipVisible(false);
      }, 250);
    };

    const handleFocus = () => {
      // We add focus to the input to get the keyboard
      // interactions for the slider out of the box.
      if (inputRef.current) inputRef.current.focus();

      setIsFocused(true);
      setIsTooltipVisible(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      setIsTooltipVisible(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTooltipVisible(false);
      }
    };

    const value = Array.isArray(thumbValue) ? thumbValue[index] : thumbValue;
    const formattedValue = format ? format(value) : value;

    return (
      <div
        aria-describedby={`sliderTooltip-${index}`}
        className={clsx(withBaseName(), {
          [withBaseName("focused")]: isFocused,
          [withBaseName("secondThumb")]: index === 1,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        style={{ left: offsetPercentage }}
        ref={ref}
      >
        <SliderTooltip
          id={`sliderTooltip-${index}`}
          value={formattedValue}
          isVisible={(isTooltipVisible || trackDragging) && !disabled}
        />
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
