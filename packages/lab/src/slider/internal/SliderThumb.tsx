import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
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
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  index?: number;
  max: number;
  maxLabel?: string;
  min: number;
  minLabel?: string;
  offsetPercentage?: string;
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
  handleInputChange,
  handlePointerDown,
  index = 0,
  max,
  maxLabel,
  min,
  minLabel,
  offsetPercentage,
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
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
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
      if (isTooltipVisible) {
        targetWindow?.addEventListener("keydown", handleKeyDown);
      }
      return () => targetWindow?.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown, targetWindow, isTooltipVisible]);

    const handlePointerEnter = () => setIsTooltipVisible(true);

    const handlePointerLeave = () => {
      // Delay hiding the tooltip to enable tooltip
      // visibility on hover
      setTimeout(() => {
        setIsTooltipVisible(false);
      }, 300);
    };

    const handleFocus = () => {
      setIsFocused(true);
      setIsTooltipVisible(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      setIsTooltipVisible(false);
    };

    const handleKeydownOnThumb = (event: React.KeyboardEvent) => {
      let newValue = value;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(value + step, max);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(value - step, min);
          break;
        case "PageUp":
          newValue = Math.min(value + step * stepMultiplier, max);
          break;
        case "PageDown":
          newValue = Math.max(value - step * stepMultiplier, min);
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          return;
      }

      event.preventDefault();

      handleInputChange({
        target: { value: newValue.toString() },
      } as ChangeEvent<HTMLInputElement>);
    };

    return (
      <div
        className={clsx(withBaseName(), {
          [withBaseName("focused")]: isFocused,
          [withBaseName("disabled")]: disabled,
          [withBaseName("dragging")]: trackDragging,
          [withBaseName("secondThumb")]: index === 1,
        })}
        data-testid="sliderThumb"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        style={{ left: offsetPercentage }}
      >
        <SliderTooltip
          value={formattedValue}
          open={(isTooltipVisible || trackDragging) && !disabled}
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
          Slider range minimum {minLabel || format?.(min) || min}, maximum{" "}
          {maxLabel || format?.(max) || max}
          {step !== 1 && `, Increments of ${step}`}
        </span>
      </div>
    );
  }
};
