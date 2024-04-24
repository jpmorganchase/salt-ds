import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";

export interface SliderTrackProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderTrack");

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(props, ref) {
    const { className, children, style, ...rest } = props;

    return (
      <div className={withBaseName("container")}>
        <div
          className={clsx(withBaseName(), className)}
          style={style}
          {...rest}
          ref={ref}
        >
          {children}
        </div>
      </div>
    );
  }
);
