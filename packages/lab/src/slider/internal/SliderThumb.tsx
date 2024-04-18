import { makePrefixer, Tooltip } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  CSSProperties,
  ComponentPropsWithoutRef,
  ReactNode,
  useMemo,
} from "react";
// import { getSliderAriaLabel } from "../utils";
import { createTrackStyle } from "./styles";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderThumbCss from "./SliderThumb.css";

const withBaseName = makePrefixer("saltSliderThumb");

export interface slilderThumbProps {
  min: number;
  max: number;
  value: number;
  index?: number;
  disabled?: boolean;
}

export function SliderThumb(props: slilderThumbProps): JSX.Element {
  const { min, max, value, disabled, style, children, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    css: sliderThumbCss,
    window: targetWindow,
  });

  const offsetValue = value + 0.5;

  const trackStyle = useMemo(
    () => createTrackStyle(min, max, offsetValue),
    [min, max, value]
  );

  // const sliderStyles = {
  //   left: `${trackStyle}`,
  // };

  return (
    // make the tooltip optional ?
    <Tooltip content={value} status={"info"} hideIcon placement="top">
      <div
        style={style}
        className={withBaseName()}
        // [withBaseName("min")]: value === min,
        // [withBaseName("max")]: value === max,
        // }
        // )}
        // style={sliderStyles}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        // aria-label={getSliderAriaLabel(valueLength, index)}
        tabIndex={0}
        // data-handle-index={index}
        {...rest}
      />
    </Tooltip>
  );
}
