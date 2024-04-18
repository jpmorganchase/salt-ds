import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { SliderRail } from "./internal/SliderRail";
import { SliderSelection } from "./SliderSelection";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderTrackCss from "./SliderTrack.css";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {
  sliderSelectionStyles: Object;
}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(props, ref) {
    const { className, children, style, ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-slider-track",
      css: sliderTrackCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), className)}
        style={style}
        {...rest}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
