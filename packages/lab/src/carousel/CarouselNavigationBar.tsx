import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

import { CarouselControls } from "./CarouselControls";
import carouselControlsCss from "./CarouselNavigationBar.css";

const withBaseName = makePrefixer("saltCarouselNavigationBar");

export interface CarouselNavigationBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * The title of the carousel that accompanies the controls.
   */
  title?: ReactNode;
}

export const CarouselNavigationBar = forwardRef<
  HTMLDivElement,
  CarouselNavigationBarProps
>(function CarouselNavigationBar({ title, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });

  return (
    <div className={withBaseName()} ref={ref} {...rest}>
      {title}
      <CarouselControls labelPlacement={title ? "left" : "right"} />
    </div>
  );
});
