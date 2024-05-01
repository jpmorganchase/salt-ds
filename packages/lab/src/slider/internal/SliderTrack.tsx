import { makePrefixer } from "@salt-ds/core";
import { useRef, ComponentPropsWithoutRef } from "react";

import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import { useSliderContext } from "./SliderContext";
import { useMouseDownTrack } from "./useMouseDownTrack";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = ({ ...props }: SliderTrackProps) => {
  const { min, max, step, setValue, onChange } = useSliderContext();

  const trackRef = useRef<HTMLDivElement>(null);

  const { trackProps } = useMouseDownTrack(
    trackRef,
    min,
    max,
    step,
    setValue,
    onChange
  );

  return (
    <div className={withBaseName()} ref={trackRef} {...trackProps} {...props}>
      <div className={withBaseName("rail")} />
      <SliderSelection />
      <SliderThumb trackRef={trackRef} />
    </div>
  );
};
