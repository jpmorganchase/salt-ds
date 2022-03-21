import { makePrefixer, Button } from "@brandname/core";
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
import {
  AnimationsDirection,
  DeckLayout,
  GridItem,
  GridLayout,
} from "../layout";
import "./Carousel.css";
import { RadioButtonGroup } from "../radio-button";
import warning from "warning";
import { useId } from "../utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@brandname/icons";

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
  direction?: AnimationsDirection;
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
    const gridTemplate = compact
      ? '"slider slider slider" "left-button dots right-button"'
      : '"left-button slider right-button" "dots dots dots"';
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
      <GridLayout
        aria-label={carouselDescription}
        aria-roledescription="carousel"
        id={id}
        role="region"
        gridTemplateColumns="min-content auto min-content"
        gridTemplateAreas={gridTemplate}
        ref={ref}
      >
        <GridItem className={withBaseName("button")} area="left-button">
          <Button variant="secondary" onClick={() => moveSlide("left")}>
            <ChevronLeftIcon size="medium" />
          </Button>
        </GridItem>
        <GridItem area="slider">
          <DeckLayout
            activeIndex={selectedSlide}
            animation={animation}
            direction={direction}
          >
            {children}
          </DeckLayout>
        </GridItem>
        <GridItem className={withBaseName("button")} area="right-button">
          <Button variant="secondary" onClick={() => moveSlide("right")}>
            <ChevronRightIcon size="medium" />
          </Button>
        </GridItem>
        <GridItem area="dots" justify="center">
          <RadioButtonGroup
            row
            aria-label="Carousel buttons"
            onChange={handleRadioChange}
            radios={Array.from({ length: slidesCount }, (_, index) => ({
              value: `${index}`,
            }))}
            value={`${selectedSlide}`}
          />
        </GridItem>
      </GridLayout>
    );
  }
);
