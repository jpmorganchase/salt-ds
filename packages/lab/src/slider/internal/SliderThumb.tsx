import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type RefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import sliderThumbCss from "./SliderThumb.css";
import { SliderTooltip } from "./SliderTooltip";

const withBaseName = makePrefixer("saltSliderThumb");

interface SliderThumbProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "onChange" | "defaultValue" | "min" | "max"
  > {
  disabled: boolean;
  format?: (value: number) => number | string;
  handleBlur: () => void;
  handleFocus: (event: React.FocusEvent) => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleKeydownOnThumb: (event: React.KeyboardEvent) => void;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  index?: number;
  inputRef?: RefObject<HTMLInputElement>;
  isFocusVisible: boolean;
  max: number;
  maxLabel?: string;
  min: number;
  minLabel?: string;
  offsetPercentage?: string;
  showTooltip?: boolean;
  sliderValue: [number, number] | number;
  step: number;
  stepMultiplier: number;
  trackDragging: boolean;
}

export const SliderThumb = ({
  "aria-label": ariaLabel,
  "aria-valuetext": ariaValueText,
  "aria-labelledby": ariaLabelledBy,
  disabled,
  format,
  handleBlur,
  handleFocus,
  handleInputChange,
  handleKeydownOnThumb,
  handlePointerDown,
  index = 0,
  inputRef,
  isFocusVisible,
  max,
  maxLabel,
  min,
  minLabel,
  offsetPercentage,
  showTooltip,
  sliderValue,
  step,
  stepMultiplier,
  trackDragging,
  ...rest
}: SliderThumbProps) => {
  {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-slider-thumb",
      css: sliderThumbCss,
      window: targetWindow,
    });

    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const id = useId();
    const accessibleTextId = `saltSlider-${id}-${index}`;
    const value = Array.isArray(sliderValue) ? sliderValue[index] : sliderValue;
    const formattedValue = format ? format(value) : value;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTooltipVisible(false);
      }
    }, []);

    useEffect(() => {
      if (showTooltip && isTooltipVisible) {
        targetWindow?.addEventListener("keydown", handleKeyDown);
      }
      return () => targetWindow?.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown, isTooltipVisible, showTooltip, targetWindow]);

    const handlePointerEnter = () => setIsTooltipVisible(true);

    const handlePointerLeave = () => {
      // Delay hiding the tooltip to enable tooltip
      // visibility on hover
      setTimeout(() => {
        setIsTooltipVisible(false);
      }, 300);
    };

    return (
      <div
        className={clsx(withBaseName(), {
          [withBaseName("focusVisible")]: isFocusVisible,
          [withBaseName("disabled")]: disabled,
          [withBaseName("dragging")]: trackDragging,
          [withBaseName("secondThumb")]: index === 1,
        })}
        data-testid="sliderThumb"
        onPointerDown={handlePointerDown}
        style={{ left: offsetPercentage }}
        {...(showTooltip && {
          onPointerEnter: handlePointerEnter,
          onPointerLeave: handlePointerLeave,
        })}
      >
        {showTooltip && (
          <SliderTooltip
            value={formattedValue}
            open={
              (isTooltipVisible || trackDragging || isFocusVisible) && !disabled
            }
          />
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
          onKeyDown={handleKeydownOnThumb}
          aria-labelledby={ariaLabelledBy}
          aria-valuenow={value}
          aria-valuetext={ariaValueText || format?.(value).toString()}
          aria-label={ariaLabel}
          aria-describedby={accessibleTextId}
          min={min}
          max={max}
          step={step}
          {...rest}
        />
        {/* Accessible text */}
        <span
          aria-hidden="true"
          id={accessibleTextId}
          className={withBaseName("accessibleText")}
        >
          {Array.isArray(sliderValue) &&
            `${index === 0 ? "leading" : "trailing"}, ${format?.(sliderValue[0]) || sliderValue[0]} to ${format?.(sliderValue[1]) || sliderValue[1]}, `}
          Slider range {minLabel && `From ${minLabel}, `}
          {maxLabel && `To ${maxLabel},`} minimum {format?.(min) || min},
          maximum {format?.(max) || max}
          {step !== 1 && `, Increments of ${step}`}
        </span>
      </div>
    );
  }
};
