import { type RenderPropsType, makePrefixer, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type KeyboardEventHandler,
  forwardRef,
  useRef,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import {
  CarouselTab,
  type CarouselTabProps,
  useCarouselTab,
} from "./CarouselTab";
import carouselControlsCss from "./CarouselTabList.css";

const withBaseName = makePrefixer("saltCarouselTabList");

/**
 * Props for the CarouselTabList component.
 */
export interface CarouselTabListProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Render prop to enable customisation of tab button.
   */
  render?: RenderPropsType["render"];
}

const CarouselTabRenderer = forwardRef<
  HTMLButtonElement,
  CarouselTabProps & { render?: CarouselTabListProps["render"] }
>((props, ref) => {
  return renderProps(CarouselTab, { ...props, ref });
});

export const CarouselTabList = forwardRef<HTMLDivElement, CarouselTabListProps>(
  function CarouselTabList({ className, render, onKeyDown, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-controls",
      css: carouselControlsCss,
      window: targetWindow,
    });

    const { emblaApi } = useCarouselContext();
    const { selectedIndex, scrollSnaps, onClick } = useCarouselTab(emblaApi);

    const slideNodes = emblaApi?.slideNodes();
    const numberOfSlides = slideNodes?.length ?? 0;
    const slidesPerTransition = numberOfSlides
      ? Math.ceil(numberOfSlides / scrollSnaps.length)
      : 0;

    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      let newIndex = selectedIndex;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        newIndex =
          (selectedIndex + direction + scrollSnaps.length) % scrollSnaps.length;
      } else if (event.key === "Home") {
        newIndex = 0;
      } else if (event.key === "End") {
        newIndex = scrollSnaps.length - 1;
      }

      if (newIndex !== selectedIndex) {
        onClick(newIndex);
        buttonRefs.current[newIndex]?.focus();
        event.preventDefault();
        event.stopPropagation();
      }
      onKeyDown?.(event);
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
        {scrollSnaps.map((_, tabIndex) => {
          const startSlideNumber = tabIndex * slidesPerTransition + 1;
          const endSlideNumber = Math.min(
            startSlideNumber + slidesPerTransition - 1,
            numberOfSlides,
          );
          const label =
            startSlideNumber === endSlideNumber
              ? `Slide ${startSlideNumber}`
              : `Slides ${startSlideNumber}-${endSlideNumber} of ${numberOfSlides}`;

          const selected = selectedIndex === tabIndex;

          const ariaControls = slideNodes?.length
            ? slideNodes[startSlideNumber - 1].id
            : undefined;
          return (
            <CarouselTabRenderer
              key={`carouselTab-${tabIndex}}`}
              ref={(element: HTMLButtonElement) => {
                buttonRefs.current[tabIndex] = element;
              }}
              render={render}
              role={"tab"}
              onClick={() => onClick(tabIndex)}
              aria-selected={selected}
              selected={selected}
              tabIndex={selected ? 0 : -1}
              aria-label={label}
              aria-labelledby={ariaControls}
              aria-controls={ariaControls}
            />
          );
        })}
      </div>
    );
  },
);
