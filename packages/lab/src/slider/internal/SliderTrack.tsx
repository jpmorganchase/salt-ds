import { makePrefixer } from "@salt-ds/core";
import { type ComponentPropsWithoutRef, useRef, useState } from "react";

import { useSliderContext } from "./SliderContext";
import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import { usePointerDown } from "./usePointerDown";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = ({ ...props }: SliderTrackProps) => {
  const { min, max, step, value, onChange } = useSliderContext();

  const trackRef = useRef<HTMLDivElement>(null);

  const [activeThumb, setActiveThumb] = useState<number | undefined>(undefined);

  const { trackProps } = usePointerDown(
    trackRef,
    min,
    max,
    step,
    value,
    onChange,
    null,
    activeThumb,
    setActiveThumb,
  );

  return (
    <div className={withBaseName()} ref={trackRef} {...trackProps} {...props}>
      <div className={withBaseName("rail")} />
      <SliderSelection />
      {value.map((value, i) => {
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
