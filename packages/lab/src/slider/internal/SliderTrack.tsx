import { Text, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type HTMLAttributes, type RefObject, forwardRef } from "react";
import sliderTrackCss from "./SliderTrack.css";
import { calculateMarkerPosition } from "./utils";

const withBaseName = makePrefixer("saltSliderTrack");

interface SliderTrackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  children: React.ReactNode;
  disabled: boolean;
  format?: (value: number) => string | number;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isRange?: boolean;
  labelPosition: "inline" | "bottom";
  markers?: { label: string; value: number }[];
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
      labelPosition,
      markers,
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
          [withBaseName("withInlineLabels")]:
            !markers && labelPosition === "inline",
          [withBaseName("range")]: isRange,
          [withBaseName("withMarkers")]: markers,
        })}
        data-testid="sliderTrack"
        ref={ref}
        {...rest}
      >
        <div className={clsx(withBaseName("container"))}>
          {/* Min Label */}
          <Text
            aria-hidden
            className={withBaseName("minLabel")}
            color="secondary"
            disabled={disabled}
            styleAs="label"
          >
            {minLabel || format?.(min) || min}
          </Text>
          {/* Slider Track */}
          <div className={withBaseName("wrapper")}>
            <div
              className={clsx(withBaseName("rail"))}
              onPointerDown={handlePointerDown}
              ref={sliderRef}
              style={
                {
                  "--slider-progressPercentage": `${progressPercentage}%`,
                  "--slider-progressPercentageStart": `${progressPercentageRange?.[0]}%`,
                  "--slider-progressPercentageEnd": `${progressPercentageRange?.[1]}%`,
                } as React.CSSProperties
              }
            >
              {isRange && <div className={clsx(withBaseName("fill"))} />}
              {children}
            </div>
          </div>
          {/* Max label */}
          <Text
            aria-hidden
            className={withBaseName("maxLabel")}
            color="secondary"
            disabled={disabled}
            styleAs="label"
          >
            {maxLabel || format?.(max) || max}
          </Text>
        </div>
        {/* Markers */}
        {markers && (
          <div className={withBaseName("markers")}>
            {markers.map(({ label, value }) => {
              return (
                value !== min &&
                value !== max && (
                  <Text
                    aria-hidden
                    className={withBaseName("markerLabel")}
                    data-testid="marker"
                    disabled={disabled}
                    color="secondary"
                    key={value}
                    styleAs="label"
                    style={
                      {
                        "--slider-marker-percentage": `${calculateMarkerPosition(value, max, min)}%`,
                      } as React.CSSProperties
                    }
                  >
                    {label}
                  </Text>
                )
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
