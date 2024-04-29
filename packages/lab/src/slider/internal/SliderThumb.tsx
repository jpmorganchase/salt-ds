import { makePrefixer, Tooltip } from "@salt-ds/core";
import { clsx } from "clsx";
import { getPercentage } from "./utils";
import {
  ComponentPropsWithoutRef,
  useState,
  useEffect,
  RefObject,
} from "react";
import { useMouseThumbDown } from "./useMouseThumbDown";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  trackRef: RefObject<HTMLDivElement>;
  disabled?: boolean;
  index?: number;
  tooltipPlacement?: "left" | "right" | "top" | "bottom";
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { trackRef, tooltipPlacement, className, ...rest } = props;

  const { min, max, step, value, setValue, onChange } = useSliderContext();

  // Could probably take the below and put in its down hook, similar to useMouseTrack down
  // Logic looks good, just need to add in step for calcuation
  // Add input html
  // create your own version of the tooltip

  //TODO: sort the onKey down interaction - add to slider thumb

  // const onKeyDown = useSliderKeyDown(value, min, max, step, setValue, onChange);

  const { thumbProps } = useMouseThumbDown(
    trackRef,
    min,
    max,
    step,
    value,
    setValue,
    onChange
  );

  // const [thumbFocus, setThumbFocus] = useState(false);
  // const [mouseDown, setMouseDown] = useState(false);

  // useEffect(() => {
  //   document.addEventListener("mouseup", handleMouseUp);
  //   return () => {
  //     document.removeEventListener("mouseup", handleMouseUp);
  //   };
  // }, []);

  // const handleMouseUp = () => {
  //   setMouseDown(false);
  //   setThumbFocus(false);
  // };

  // const handleMouseLeave = () => {
  //   if (!mouseDown) {
  //     setThumbFocus(false);
  //   }
  // };

  // const handleMouseDown = () => {
  //   setMouseDown(true);
  //   setThumbFocus(true);
  // };

  const percentage = getPercentage(min, max, value);

  return (
    <Tooltip
      content={value}
      // open={thumbFocus}
      status={"info"}
      hideIcon
      placement={tooltipPlacement}
    >
      <div
        className={withBaseName("selectionArea")}
        style={{ left: `${percentage}` }}
        // onBlur={() => setThumbFocus(false)}
        // onFocus={() => setThumbFocus(true)}
        // onMouseDown={() => handleMouseDown()}
        // onMouseLeave={() => handleMouseLeave()}
        // onMouseOver={() => setThumbFocus(true)}
      >
        <div
          className={clsx(withBaseName(), className)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation="horizontal"
          tabIndex={0}
          {...rest}
        />
      </div>
    </Tooltip>
  );
}
