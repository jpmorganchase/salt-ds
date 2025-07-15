import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type SyntheticEvent,
  useRef,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import {
  CarouselTab,
  type CarouselTabProps,
  useCarouselTab,
} from "./CarouselTab";
import carouselControlsCss from "./CarouselTabList.css";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

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

export interface CarouselTabRendererProps extends CarouselTabProps {
  render?: CarouselTabListProps["render"];
}

const CarouselTabRenderer = forwardRef<
  HTMLButtonElement,
  CarouselTabRendererProps
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
    const { selectedIndex, scrollSnaps } = useCarouselTab(emblaApi);

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
        emblaApi?.scrollTo(newIndex);
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
        tabIndex={-1}
        className={clsx(withBaseName(), className)}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...rest}
      >
        {scrollSnaps.map((_, scrollSnapIndex) => {
          const visibleSlides = getVisibleSlideIndexes(
            emblaApi,
            scrollSnapIndex,
          );
          const startSlideNumber = visibleSlides[0];
          const endSlideNumber =
            visibleSlides.length > 1
              ? visibleSlides[visibleSlides.length - 1]
              : undefined;
          const slidePosition = endSlideNumber
            ? `${startSlideNumber}-${endSlideNumber}`
            : startSlideNumber;

          const selected = selectedIndex === scrollSnapIndex;

          const startSlideIndex = startSlideNumber - 1;
          const ariaControls = slideNodes?.length
            ? slideNodes[startSlideIndex].id
            : undefined;
          return (
            <CarouselTabRenderer
              key={`carouselTab-${scrollSnapIndex}}`}
              ref={(element: HTMLButtonElement) => {
                buttonRefs.current[scrollSnapIndex] = element;
              }}
              render={render}
              role={"tab"}
              selected={selected}
              onClick={(_event: SyntheticEvent) =>
                emblaApi?.scrollTo(scrollSnapIndex)
              }
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              aria-label={`Selected ${slidePosition} of ${numberOfSlides} slides`}
              aria-controls={ariaControls}
            />
          );
        })}
      </div>
    );
  },
);
