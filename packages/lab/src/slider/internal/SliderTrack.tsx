import { makePrefixer } from "@salt-ds/core";
import { useRef } from "react";
import { getPercentage, getValue } from "./utils";
import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = () => {
  const { min, max, step, value, setValue, onChange } = useSliderContext();

  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = getPercentage(min, max, value);

  return (
    <div
      className={withBaseName()}
      ref={trackRef}
      onMouseDown={(event) =>
        getValue(trackRef, min, max, step, setValue, onChange, event)
      }
    >
      <div className={withBaseName("rail")} />
      <SliderSelection style={{ width: `${percentage}` }} />
      <SliderThumb trackRef={trackRef} />
    </div>
  );
};
