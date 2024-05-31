import { makePrefixer } from "@salt-ds/core";
import { useRef, ComponentPropsWithoutRef, useState } from "react";

import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import { useSliderContext } from "./SliderContext";
import { usePointerDownTrack } from "./usePointerDownTrack";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = ({ ...props }: SliderTrackProps) => {
  const { min, max, step, value, onChange } = useSliderContext();

  const trackRef = useRef<HTMLDivElement>(null);

  const [activeThumb, setActiveThumb] = useState<number | undefined>(undefined);

  const { trackProps } = usePointerDownTrack(
    trackRef,
    min,
    max,
    step,
    value,
    onChange
  );

  const thumbs = Array.isArray(value) ? value : [value];

  return (
    <div className={withBaseName()} ref={trackRef} {...trackProps} {...props}>
      <div className={withBaseName("rail")} />
      <SliderSelection />
      {thumbs.map((value, i) => {
        return (
          <SliderThumb
            key={i}
            index={i}
            trackRef={trackRef}
            activeThumb={activeThumb}
            setActiveThumb={setActiveThumb}
          />
        );
      })}
    </div>
  );
};
