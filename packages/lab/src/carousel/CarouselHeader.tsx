import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

import { CarouselControls } from "./CarouselControls";
import carouselControlsCss from "./CarouselHeader.css";

const withBaseName = makePrefixer("saltCarouselHeader");

export interface CarouselHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
}

export const CarouselHeader = forwardRef<HTMLDivElement, CarouselHeaderProps>(
  function CarouselHeader({ title, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-controls",
      css: carouselControlsCss,
      window: targetWindow,
    });

    return (
      <div className={withBaseName()} ref={ref} {...rest}>
        {title}
        <CarouselControls labelPlacement={title ? "right" : "left"} />
      </div>
    );
  },
);
