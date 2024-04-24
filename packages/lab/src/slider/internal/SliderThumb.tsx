import { makePrefixer, Tooltip } from "@salt-ds/core";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, useState, useEffect } from "react";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  min: number;
  max: number;
  value: number;
  disabled?: boolean;
  index?: number;
  tooltipPlacement?: "left" | "right" | "top" | "bottom";
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { min, max, value, tooltipPlacement, className, ...rest } = props;

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const [thumbFocus, setThumbFocus] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const handleMouseUp = () => {
    setMouseDown(false);
    setThumbFocus(false);
  };

  const handleMouseLeave = () => {
    if (!mouseDown) {
      setThumbFocus(false);
    }
  };

  const handleMouseDown = () => {
    setMouseDown(true);
    setThumbFocus(true);
  };

  return (
    <Tooltip
      content={value}
      open={thumbFocus}
      status={"info"}
      hideIcon
      placement={tooltipPlacement}
    >
      <div
        className={withBaseName("selectionArea")}
        onBlur={() => setThumbFocus(false)}
        onFocus={() => setThumbFocus(true)}
        onMouseDown={() => handleMouseDown()}
        onMouseLeave={() => handleMouseLeave()}
        onMouseOver={() => setThumbFocus(true)}
      >
        <div
          className={clsx(withBaseName(), className)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
          {...rest}
        />
      </div>
    </Tooltip>
  );
}
