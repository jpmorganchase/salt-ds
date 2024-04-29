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

export function useMouseTrackDown(trackRef: RefObject<Element>, min: number, max: number, step: number, setValue, onChange) {

  console.log('mouseDownTrack')

  // Set the currentPointer value to null at the start each time
  // Could then pass in value which should persist - value might also need to be stored in a ref to prevent if reverting back to default position

  let currentPointer = useRef<number | null | undefined>(undefined);

  let onDownTrack = (event: React.UIEvent, id: number) => {
    const { clientX, clientY} = event
    const { height, width, x, y} = trackRef.current.getBoundingClientRect()
    const localX = clientX - x
    // Local y will be used for vertical alignment, orientatino will need to be passed into the hook
    const localY = clientY - y
    const normaliseBetweenValues = (localX / width) * (max - min) + min;
    let value = roundToStep(normaliseBetweenValues, step);
    value = roundToTwoDp(value);
    // value = clampValue(value)
    setValue(value)
    // event.preventDefault();
  }

    return  {trackProps: {onMouseDown(){onDownTrack(event, 'id')}}}
  
}
