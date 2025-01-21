import { Text, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type HTMLAttributes, type RefObject, forwardRef } from "react";
import { calculateMarkerPosition } from "./utils";

const withBaseName = makePrefixer("saltSlider");

interface SliderTrackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  children: React.ReactNode;
  disabled: boolean;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  isDragging: boolean;
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
      className: classNameProp,
      children,
      disabled,
      handleMouseDown,
      isDragging,
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
    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("dragging")]: isDragging,
            [withBaseName(`${labelPosition}Labels`)]: !markers,
            [withBaseName("withMarkers")]: markers,
          },
          classNameProp,
        )}
        ref={ref}
        {...rest}
      >
        {/* Min Label */}
        {!markers && (
          <Text as="label" className={withBaseName("minLabel")}>
            {minLabel || min}
          </Text>
        )}
        {/* Slider Track */}
        <div
          className={withBaseName("track")}
          onMouseDown={handleMouseDown}
          ref={sliderRef}
          style={
            {
              "--slider-progressPercentage": `${progressPercentage}%`,
              "--slider-progressPercentageStart": `${progressPercentageRange?.[0]}%`,
              "--slider-progressPercentageEnd": `${progressPercentageRange?.[1]}%`,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
        {/* Max label */}
        {!markers && (
          <Text as="label" className={withBaseName("maxLabel")}>
            {maxLabel || max}
          </Text>
        )}
        {/* Markers */}
        {markers && (
          <div className={withBaseName("markers")}>
            {markers.map(
              (marker: { label: string; value: number | string }) => (
                <Text
                  className={withBaseName("marker-label")}
                  style={
                    {
                      "--slider-marker-percentage": `${calculateMarkerPosition(marker.value, min, max)}%`,
                    } as React.CSSProperties
                  }
                  key={marker.value}
                  as="label"
                >
                  {marker.label}
                </Text>
              ),
            )}
          </div>
        )}
      </div>
    );
  },
);
