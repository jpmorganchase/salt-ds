import { makePrefixer, renderProps, type RenderPropsType } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type HTMLAttributes, forwardRef, useRef } from "react";
import { useCarouselContext } from "./CarouselContext";
import { CarouselDotButton, useDotButton } from "./CarouselDotButton";
import carouselControlsCss from "./CarouselTabList.css";

const withBaseName = makePrefixer("saltCarouselTabList");

/**
 * Props for the CarouselTabList component.
 */
export interface CarouselTabListProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * Render prop to enable customisation of dot button.
   */
  render?: RenderPropsType["render"];
}

export const CarouselTabList = forwardRef<
  HTMLDivElement,
  CarouselTabListProps
>(function CarouselTabList({ className, render, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });

  const { emblaApi } = useCarouselContext();
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const slideNodes = emblaApi?.slideNodes();
  const numberOfSlides =  slideNodes?.length ?? 0;
  const slidesPerTransition = numberOfSlides ? Math.ceil(numberOfSlides / scrollSnaps.length) : 0;

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    let newIndex = selectedIndex;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      newIndex = (selectedIndex + direction + scrollSnaps.length) % scrollSnaps.length;
    } else if (event.key === "Home") {
      newIndex = 0;
    } else if (event.key === "End") {
      newIndex = scrollSnaps.length - 1;
    }

    if (newIndex !== selectedIndex) {
      onDotButtonClick(newIndex);
      buttonRefs.current[newIndex]?.focus();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Choose slide"
      tabIndex={0}
      className={clsx(withBaseName(), className)}
      onKeyDown={handleKeyDown}
      ref={ref}
      {...rest}
    >
      {scrollSnaps.map((_, dotIndex) => {
        const startSlideNumber = dotIndex * slidesPerTransition + 1;
        const endSlideNumber = Math.min(
          startSlideNumber + slidesPerTransition - 1,
          numberOfSlides
        );
        const label =
          startSlideNumber === endSlideNumber
            ? `Slide ${startSlideNumber}`
            : `Slides ${startSlideNumber}-${endSlideNumber} of ${numberOfSlides}`;

        const selected = selectedIndex === dotIndex;

        const ariaControls = slideNodes?.length ? slideNodes[startSlideNumber-1].id : undefined;
        return renderProps( CarouselDotButton, {
          key: label,
          render,
          role: "tab",
          onClick: () => onDotButtonClick(dotIndex),
          "aria-selected": selected,
          selected: selected,
          tabIndex: selected ? 0 : -1,
          "aria-labelledby": ariaControls,
          "aria-controls": ariaControls,
          ref: (el: HTMLButtonElement) => (buttonRefs.current[dotIndex] = el), // Store button ref
        });
      })}
    </div>
  );
});
