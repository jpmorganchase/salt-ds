import { makePrefixer, Tooltip } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderThumbCss from "./SliderThumb.css";

const withBaseName = makePrefixer("saltSliderThumb");

export interface slilderThumbProps {
  min: number;
  max: number;
  value: number;
  disabled?: boolean;
  index?: number;
}

export function SliderThumb(props: slilderThumbProps): JSX.Element {
  const { min, max, value, disabled, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    css: sliderThumbCss,
    window: targetWindow,
  });

  return (
    <Tooltip content={value} status={"info"} hideIcon placement="top">
      <div
        className={withBaseName()}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={0}
        // data-handle-index={index} What is this for ?
        {...rest}
      />
    </Tooltip>
  );
}
