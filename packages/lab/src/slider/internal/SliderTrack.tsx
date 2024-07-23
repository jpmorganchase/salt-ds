import { makePrefixer } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSliderContext } from "./SliderContext";
import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import { getNearestIndex, getValue, setValue } from "./utils";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = ({ ...props }: SliderTrackProps) => {
  const { min, max, step, value, onChange } = useSliderContext();

  const trackRef = useRef<HTMLDivElement>(null);

  const [activeThumb, setActiveThumb] = useState<number | undefined>(undefined);

  const [pointerDown, setPointerDown] = useState(false);

  const handlePointerUp = () => {
    setActiveThumb(undefined);
    setPointerDown(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const { clientX } = event;
    const newValue: number = getValue(trackRef, min, max, step, clientX);
    const nearestIndex = getNearestIndex(value, newValue);
    setValue(value, newValue, value.length > 1 ? nearestIndex : 0, onChange);
    setActiveThumb(nearestIndex);
    setPointerDown(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown || typeof activeThumb === "undefined") return;
    const { clientX } = event;
    const rawValue: number = getValue(trackRef, min, max, step, clientX);

    const nonOverlappingValue =
      value.length > 1
        ? activeThumb === 0
          ? Math.min(rawValue, value[1] - step)
          : Math.max(rawValue, value[0] + step)
        : rawValue;

    setValue(value, nonOverlappingValue, activeThumb, onChange);
  };

  const handlePointerOut = () => {
    if (!pointerDown) {
      setActiveThumb(undefined);
    }
  };

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return (
    <div
      className={withBaseName()}
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      {...props}
    >
      <div className={withBaseName("rail")} />
      <SliderSelection />
      {value.map((_, i) => {
        return (
          <SliderThumb
            key={i}
            index={i}
            activeThumb={activeThumb}
            setActiveThumb={setActiveThumb}
          />
        );
      })}
    </div>
  );
};
