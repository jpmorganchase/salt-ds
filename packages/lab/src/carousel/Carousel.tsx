import {
  Button,
  makePrefixer,
  useId,
  RadioButtonGroup,
  GridLayout,
} from "@jpmorganchase/uitk-core";
import {
  ChangeEventHandler,
  Children,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useEffect,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import warning from "warning";
import cx from "classnames";
import "./Carousel.css";
import { DeckLayout } from "../layout";
import { useSlideSelection } from "../utils";
import { CarouselSlideProps } from "./CarouselSlide";

const withBaseName = makePrefixer("uitkCarousel");

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial Index enables you to select the active slide in the carousel.
   * Optional, default 0.
   **/
  initialIndex?: number;
  /**
   * The animation when the slides are shown.
   * Optional. Defaults to `slide`
   **/
  animation?: "slide" | "fade";
  /**
   * If this props is passed it will set the aria-label with value to the carousel container.
   * Optional. Defaults to undefined
   */
  carouselDescription?: string;
  /**
   * Collection of slides to render
   * Component must implement CarouselSlideProps. Mandatory.
   */
  children: Array<ReactElement<CarouselSlideProps>>;
  /**
   * This prop will enable compact / reduced width mode.
   * The navigation buttons would be part of indicators
   * Optional. Defaults to false
   **/
  compact?: boolean;
  /**
   * It sets the id for the Carousel Container.
   * String. Optional
   */
  id?: string;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      initialIndex,
      animation = "slide",
      carouselDescription,
      children,
      className,
      compact,
      id: idProp,
      ...rest
    },
    ref
  ) {
    const id = useId(idProp);
    const slidesCount = Children.count(children);

    const [_, selectedSlide, handleSlideSelection] =
      useSlideSelection(initialIndex);

    const moveSlide = (direction: "left" | "right") => {
      const moveLeft =
        selectedSlide === 0 ? slidesCount - 1 : selectedSlide - 1;
      const moveRight =
        selectedSlide === slidesCount - 1 ? 0 : selectedSlide + 1;
      const newSelection = direction === "left" ? moveLeft : moveRight;
      const newTransition = direction === "left" ? "decrease" : "increase";
      handleSlideSelection(newSelection, newTransition);
    };

    const handleRadioChange: ChangeEventHandler<HTMLInputElement> = ({
      target: { value },
    }) => {
      handleSlideSelection(Number(value));
    };

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
        ref={ref}
        gap={0}
        columns={3}
        className={cx(
          withBaseName(),
          compact && withBaseName("compact"),
          className
        )}
        {...rest}
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
      </GridLayout>
    );
  }
);
