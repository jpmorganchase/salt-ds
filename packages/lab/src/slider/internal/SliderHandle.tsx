import { makePrefixer, Tooltip, useTooltip } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { CSSProperties } from "react";
import { getSliderAriaLabel } from "./utils";

import "../Slider.css";

const withBaseName = makePrefixer("uitkSliderHandle");

export interface SliderHandleProps {
  min: number;
  max: number;
  value: number;
  index: number;
  disabled: boolean;
  valueLength: number;
  style: CSSProperties;
}

export function SliderHandle(props: SliderHandleProps): JSX.Element {
  const { min, max, value, disabled, valueLength, index, style } = props;

  const { getTriggerProps, getTooltipProps } = useTooltip({ placement: "top" });

  return (
    <div
      key={index}
      className={cn(withBaseName(), {
        [withBaseName("min")]: value === min,
        [withBaseName("max")]: value === max,
      })}
      style={style}
      role="slider"
      data-handle-index={index}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-disabled={disabled}
      aria-label={getSliderAriaLabel(valueLength, index)}
    >
      <Tooltip
        {...getTooltipProps({ title: `${value}`, disablePortal: true })}
      />
      <div
        {...getTriggerProps<"div">({
          className: withBaseName("box"),
          tabIndex: 0,
        })}
      />
    </div>
  );
}
