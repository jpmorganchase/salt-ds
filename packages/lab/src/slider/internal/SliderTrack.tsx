import { makePrefixer } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ActiveThumbIndex, SliderValue, ThumbIndex } from "../types";
import { useSliderContext } from "./SliderContext";
import { SliderSelection } from "./SliderSelection";
import { SliderThumb } from "./SliderThumb";
import {
  getNearestIndex,
  getValue,
  preventOverlappingValues,
  setValue,
} from "./utils";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = ({ ...props }: SliderTrackProps) => {
  const { min, max, step, value, onChange } = useSliderContext();

  const trackRef = useRef<HTMLDivElement>(null);

  const valueRef = useRef<SliderValue>(value);

  const [activeThumb, setActiveThumbState] =
    useState<ActiveThumbIndex>(undefined);
  const activeThumbRef = useRef<ActiveThumbIndex>(undefined);
  const pointerDown = useRef(false);

  const setActiveThumb = (index: ActiveThumbIndex) => {
    setActiveThumbState(index);
    activeThumbRef.current = index;
  };

  const handlePointerUp = () => {
    setActiveThumb(undefined);
    pointerDown.current = false;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const { clientX } = event;
    const newValue: number = getValue(trackRef, min, max, step, clientX);
    const nearestIndex = getNearestIndex(value, newValue);
    setValue(value, newValue, value.length > 1 ? nearestIndex : 0, onChange);
    setActiveThumb(nearestIndex);
    pointerDown.current = true;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!pointerDown.current || typeof activeThumbRef.current === "undefined")
      return;
    const thumb = activeThumbRef.current;
    const { clientX } = event;
    const rawValue: number = getValue(trackRef, min, max, step, clientX);
    const newValue = preventOverlappingValues(
      valueRef.current,
      rawValue,
      thumb,
    );
    setValue(valueRef.current, newValue, thumb, onChange);
  };

  const handlePointerOut = () => {
    if (!pointerDown.current) {
      setActiveThumb(undefined);
    }
  };

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return (
    <div
      className={withBaseName()}
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerOut={handlePointerOut}
      {...props}
    >
      <div className={withBaseName("rail")} />
      <SliderSelection />
      {value.map((_, i) => {
        return (
          <SliderThumb
            key={i}
            index={i as ThumbIndex}
            activeThumb={activeThumb}
            setActiveThumb={setActiveThumb}
          />
        );
      })}
    </div>
  );
};
