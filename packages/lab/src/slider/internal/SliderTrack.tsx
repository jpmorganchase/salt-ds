import { Text, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type HTMLAttributes, type RefObject, forwardRef } from "react";
import sliderTrackCss from "./SliderTrack.css";
import { calculateMarkPosition } from "./utils";

const withBaseName = makePrefixer("saltSliderTrack");

interface SliderTrackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  children: React.ReactNode;
  disabled: boolean;
  format?: (value: number) => string | number;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isRange?: boolean;
  marks?: { label: string; value: number }[];
  max: number;
  maxLabel?: number | string;
  min: number;
  minLabel?: number | string;
  progressPercentage?: number;
  progressPercentageRange?: [number, number];
  sliderRef: RefObject<HTMLDivElement>;
}

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(
    {
      children,
      disabled,
      format,
      handlePointerDown,
      isDragging,
      isRange = false,
      marks,
      max,
      maxLabel,
      min,
      minLabel,
      progressPercentage,
      progressPercentageRange,
      sliderRef,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-slider-track",
      css: sliderTrackCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), {
          [withBaseName("disabled")]: disabled,
          [withBaseName("dragging")]: isDragging,
          [withBaseName("range")]: isRange,
          [withBaseName("withMarks")]: marks,
        })}
        data-testid="sliderTrack"
        ref={ref}
        {...rest}
      >
        <div className={clsx(withBaseName("container"))}>
          {minLabel && (
            <Text
              aria-hidden
              className={withBaseName("minLabel")}
              color="secondary"
              disabled={disabled}
              styleAs="label"
            >
              {minLabel || format?.(min)}
            </Text>
          )}
          {/* Slider Track */}
          <div className={withBaseName("wrapper")}>
            <div
              className={clsx(withBaseName("rail"))}
              onPointerDown={handlePointerDown}
              ref={sliderRef}
              style={
                {
                  ...(progressPercentage !== undefined && {
                    "--slider-progressPercentage": `${progressPercentage}%`,
                  }),
                  ...(progressPercentageRange?.[0] !== undefined && {
                    "--slider-progressPercentageStart": `${progressPercentageRange[0]}%`,
                  }),
                  ...(progressPercentageRange?.[1] !== undefined && {
                    "--slider-progressPercentageEnd": `${progressPercentageRange[1]}%`,
                  }),
                } as React.CSSProperties
              }
            >
              {isRange && <div className={clsx(withBaseName("fill"))} />}
              {children}
            </div>
            {/* Marks */}
            {marks && (
              <div className={withBaseName("marks")}>
                {marks.map(({ label, value }) => {
                  return (
                    <Text
                      aria-hidden
                      className={withBaseName("markLabel")}
                      data-testid="mark"
                      disabled={disabled}
                      color="secondary"
                      key={value}
                      styleAs="label"
                      style={
                        {
                          "--slider-mark-percentage": `${calculateMarkPosition(value, max, min)}%`,
                        } as React.CSSProperties
                      }
                    >
                      {label}
                    </Text>
                  );
                })}
              </div>
            )}
          </div>
          {maxLabel && (
            <Text
              aria-hidden
              className={withBaseName("maxLabel")}
              color="secondary"
              disabled={disabled}
              styleAs="label"
            >
              {maxLabel || format?.(max)}
            </Text>
          )}
        </div>
      </div>
    );
  },
);
