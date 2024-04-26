import {
  MouseEvent as ReactMouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef
} from "react";
import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp } from "./utils";
import { mergeProps} from '@salt-ds/core'


// I think they hold the value in state - look at useSliderState and what that does

export function useMouseTrackDown(trackRef: RefObject<Element>, max: number, min: number, step: number, setValue, onChange) {

  // Set the currentPointer value to null at the start each time
  // Could then pass in value which should persist - value might also need to be stored in a ref to prevent if reverting back to default position

  let currentPointer = useRef<number | null | undefined>(undefined);

  let onDownTrack = (event: React.UIEvent, id: number) => {
        console.log('mouse track down')
    const { clientX, clientY} = event
    const { height, width, x, y} = trackRef.current.getBoundingClientRect()
    const localX = clientX - x
    const localY = clientY - y
    const normaliseBetweenValues = (1 - (localX / width)) * (max - min) + min;
    let value = roundToStep(normaliseBetweenValues, step);
    value = roundToTwoDp(value);
    // value = clampValue(value)
    setValue(value)
    // event.preventDefault();
  }




//This mousedown is a global event - needs to be tied to the track ref
  return  {trackProps: onmousedown = (event) => {onDownTrack(event)}}
  
}
