import { makePrefixer, useForkRef } from "@salt-ds/core";
import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { clsx } from "clsx";
import { useMouseTrackDown } from "./useMouseTrackDown";
import { getPercentage } from "./utils";

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

    const { trackProps } = useMouseTrackDown(
      trackRef,
      min,
      max,
      step,
      setValue,
      onChange
    );

    // const trackGridTeplateColumns = useMemo(
    //   () => getTrackGridTemplateColumns(min, max, value),
    //   [min, max, value]
    // );

    const percentage = getPercentage(min, max, value);
    console.log(percentage);

    return (
      <div className={clsx(withBaseName("container"), className)}>
        <div
          className={withBaseName()}
          ref={trackRefs}
          {...trackProps}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  }
);
