import { DeckLayout } from "@jpmorganchase/uitk-lab";
import { Button, makePrefixer } from "@jpmorganchase/uitk-core";
import {
  ChangeEventHandler,
  Children,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { RadioButtonGroup } from "../radio-button";
import { ChevronLeftIcon, ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import warning from "warning";
import { LayoutAnimationDirection } from "../layout/types";
import { useId } from "../utils";
import cx from "classnames";
import "./Carousel.css";

const withBaseName = makePrefixer("uitkCarousel");
export type SlideDirections = "left" | "right";

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The active Index enables the consumers to select the active slide in the carousel.
   * Optional, default 0.
   **/
  activeIndex?: number;
  /**
   * The animation when the slides are shown.
   * Optional. Defaults to `slide`
   **/
  animation?: "slide" | "fade";
  /**
   * The timeout for each animation.
   * Optional. Defaults to 800 ms
   **/
  animationTimeout?: number;
  /**
   * If this props is passed it will set the aria-label with value to the carousel container.
   * Optional. Defaults to null
   */
  carouselDescription?: string;
  /**
   * Collection of slides to render
   * TODO: Component must implement CarouselSlideProps. Mandatory.
   */
  children: ReactElement[];
  /**
   * This prop will enable compact / reduced width mode.
   * The navigation buttons would be part of indicators
   * Optional. Defaults to false
   **/
  compact?: boolean;
  direction?: LayoutAnimationDirection;
  /**
   * It sets the id for the Carousel Container.
   * String. Optional
   */
  id?: string;
}

const useSlideSelection = (
  initialValue?: number
): [number, (sliderIndex: number) => void] => {
  const [selectedSlide, setSelectedSlide] = useState(initialValue ?? 0);
  const handleSlideSelection = (sliderIndex: number) => {
    setSelectedSlide(sliderIndex);
  };
  return [selectedSlide, handleSlideSelection];
};
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      activeIndex,
      animation = "slide",
      animationTimeout = 800,
      carouselDescription,
      children,
      compact,
      direction,
      id: idProp,
    },
    ref
  ) {
    const id = useId(idProp);

    const [selectedSlide, handleSlideSelection] =
      useSlideSelection(activeIndex);
    const slidesCount = Children.count(children);

    const moveSlide = (direction: SlideDirections) => {
      const moveLeft =
        selectedSlide === 0 ? slidesCount - 1 : selectedSlide - 1;
      const moveRight =
        selectedSlide === slidesCount - 1 ? 0 : selectedSlide + 1;
      const newSelection = direction === "left" ? moveLeft : moveRight;
      handleSlideSelection(newSelection);
    };
    const handleRadioChange: ChangeEventHandler<HTMLInputElement> = useCallback(
      ({ target: { value } }) => {
        handleSlideSelection(Number(value));
      },
      []
    );

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        const validNumberOfChildren = slidesCount > 1;

        warning(
          validNumberOfChildren,
          "Carousel component requires more than one children to render. At least two elements should be provided."
        );
      }
    }, [children]);
    return (
      <div
        aria-label={carouselDescription}
        aria-roledescription="carousel"
        id={id}
        role="region"
        ref={ref}
        className={cx(withBaseName(), compact && withBaseName("compact"))}
      >
        <Button
          variant="secondary"
          className={withBaseName("prev-button")}
          onClick={() => moveSlide("left")}
        >
          <ChevronLeftIcon size="medium" />
        </Button>
        <DeckLayout
          activeIndex={selectedSlide}
          animation={animation}
          className={withBaseName("slider")}
          direction={direction}
        >
          {children}
        </DeckLayout>
        <Button
          variant="secondary"
          className={withBaseName("next-button")}
          onClick={() => moveSlide("right")}
        >
          <ChevronRightIcon size="medium" />
        </Button>
        <div className={withBaseName("dots")}>
          <RadioButtonGroup
            row
            aria-label="Carousel buttons"
            onChange={handleRadioChange}
            radios={Array.from({ length: slidesCount }, (_, index) => ({
              value: `${index}`,
            }))}
            value={`${selectedSlide}`}
          />
        </div>
      </div>
    );
  }
);
