import { makePrefixer, useForkRef } from "@salt-ds/core";
import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { clsx } from "clsx";
import { useMouseTrackDown } from "./useMouseTrackDown";
import { getPercentage } from "./utils";
import { SliderSelection } from "./SliderSelection";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: () => void;
  onChange: () => void;
}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(props, ref) {
    const {
      min,
      max,
      step,
      value,
      setValue,
      onChange,
      children,
      className,
      ...rest
    } = props;

    const trackRef = useRef<HTMLDivElement>(null);
    const trackRefs = useForkRef(trackRef, ref);

    // Can this go in Selection?
    const { trackProps } = useMouseTrackDown(
      trackRef,
      min,
      max,
      step,
      setValue,
      onChange
    );

    const percentage = getPercentage(min, max, value);

    return (
      <div className={withBaseName()} ref={trackRefs} {...trackProps} {...rest}>
        <div className={withBaseName("rail")} />
        <SliderSelection style={{ width: `${percentage}` }} />
      </div>
    );
  }
);
