import {
  MouseEvent as ReactMouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp } from "./utils";
import { mergeProps } from "@salt-ds/core";


export function useMouseThumbDown(trackRef: RefObject<Element>, min: number, max: number, step: number, value: SliderValue, setValue, onChange) {
  console.log('mouseThumbDown')


  if (Array.isArray(value)){
    console.log( 'value = range')
  }

  const onDownThumb = () => {

  }


  

 return  {trackProps: {onMouseDown(){onDownThumb(event, 'id')}}, onBlur(){}, onFocus(){}, onMouseDown(){}, onMouseLeave(){}, onMouseOver(){}}
}
