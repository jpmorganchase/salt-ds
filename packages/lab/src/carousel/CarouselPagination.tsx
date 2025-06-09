import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type HTMLAttributes, forwardRef } from "react";
import { useCarouselContext } from "./CarouselContext";
import { DotButton, useDotButton } from "./CarouselDotButton";
import carouselControlsCss from "./CarouselPagination.css";
import { getSlideDescription } from "./getDescription";

const withBaseName = makePrefixer("saltCarouselPagination");

/**
 * Props for the CarouselPagination component.
 */
export interface CarouselPaginationProps
  extends HTMLAttributes<HTMLDivElement> {}

export const CarouselPagination = forwardRef<
  HTMLDivElement,
  CarouselPaginationProps
>(function CarouselPagination({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });

  const { emblaApi } = useCarouselContext();
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  return (
    <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {scrollSnaps.map((_, index) => {
        const slideNode: HTMLElement | undefined =
          emblaApi?.slideNodes()[index];
        if (!slideNode) {
          return;
        }
        return (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
            aria-label={`Move to ${getSlideDescription(slideNode, index, scrollSnaps.length)}`}
          />
        );
      })}
    </div>
  );
});
