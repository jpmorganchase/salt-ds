import { makePrefixer, Tooltip } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderThumbCss from "./SliderThumb.css";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef } from "react";
import { ManSolidIcon } from "@salt-ds/icons";

const withBaseName = makePrefixer("saltSliderThumb");

export interface SliderThumbProps extends ComponentPropsWithoutRef<"div"> {
  min: number;
  max: number;
  value: number;
  disabled?: boolean;
  index?: number;
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const { min, max, value, disabled, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    css: sliderThumbCss,
    window: targetWindow,
  });

  //Need to make the slider selection thumb larger

  return (
    <Tooltip content={value} status={"info"} hideIcon placement="top">
      <div className={withBaseName("selectionArea")}>
        <div
          className={clsx(withBaseName(), className)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          tabIndex={0}
          // data-handle-index={index} What is this for ?
          {...rest}
        />
      </div>
    </Tooltip>
  );
}
