import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import {
  CarouselTab,
  type CarouselTabProps,
  useCarouselTab,
} from "./CarouselTab";
import carouselControlsCss from "./CarouselTabList.css";
import { getSlideDescription } from "./getSlideDescription";
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

    const { emblaApi, setAriaVariant, setAnnouncementState } =
      useCarouselContext();
    const { selectedIndex, scrollSnaps } = useCarouselTab(emblaApi);

    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const [focusedTabIndex, setFocusedTabIndex] = useState<number | null>(null);

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      let newIndex = focusedTabIndex ?? selectedIndex;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        newIndex = Math.max(
          0,
          Math.min(newIndex + direction, scrollSnaps.length - 1),
        );
      } else if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = scrollSnaps.length - 1;
      }

      if (newIndex !== focusedTabIndex) {
        buttonRefs.current[newIndex]?.focus();
        setFocusedTabIndex(newIndex);
      }
      onKeyDown?.(event);
    };

    useEffect(() => {
      setAriaVariant("tabpanel");
    }, [setAriaVariant]);

    return (
      <div
        role="tablist"
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
          const startSlideNumber =
            visibleSlides.length >= 1 ? visibleSlides[0] : 0;
          const endSlideNumber =
            visibleSlides.length > 1
              ? visibleSlides[visibleSlides.length - 1]
              : 0;
          const slideNodes = emblaApi?.slideNodes();
          const numberOfSlides = slideNodes?.length;

          let ariaLabel: string;
          if (endSlideNumber >= 1) {
            ariaLabel = `Slide ${startSlideNumber} to ${endSlideNumber} of ${numberOfSlides}`;
          } else {
            const description = getSlideDescription(emblaApi, startSlideNumber);
            ariaLabel = `${description}`;
          }

          const selected = selectedIndex === scrollSnapIndex;
          const ariaControls = slideNodes?.length
            ? slideNodes[startSlideNumber - 1].id
            : undefined;

          return (
            <CarouselTabRenderer
              key={`carouselTab-${slideNodes?.[scrollSnapIndex].id}}`}
              ref={(element: HTMLButtonElement) => {
                buttonRefs.current[scrollSnapIndex] = element;
              }}
              render={render}
              role={"tab"}
              selected={selected}
              onBlur={() => {
                setFocusedTabIndex(null);
              }}
              onFocus={() => {
                setFocusedTabIndex(scrollSnapIndex);
                setAnnouncementState("tab");
                emblaApi?.scrollTo(scrollSnapIndex);
              }}
              aria-label={ariaLabel}
              aria-selected={selected}
              tabIndex={selected && focusedTabIndex === null ? 0 : -1}
              aria-controls={ariaControls}
            />
          );
        })}
      </div>
    );
  },
);
