import { makePrefixer, useForkRef } from "@salt-ds/core";
import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { clsx } from "clsx";
import { useMouseTrackDown } from "./useMouseTrackDown";
import { getPercentage } from "./utils";
import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import { useSliderContext } from "./SliderContext";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(props, ref) {
    const { children, className, ...rest } = props;

    const { min, max, step, value, setValue, onChange } = useSliderContext();

    const trackRef = useRef<HTMLDivElement>(null);
    const trackRefs = useForkRef(trackRef, ref);

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
        <SliderThumb trackRef={trackRef} />
      </div>
    );
  }
);
