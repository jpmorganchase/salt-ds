import {
  Children,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { GridLayout } from "../GridLayout";

import { makePrefixer } from "@brandname/core";
import "./DeckLayout.css";
import { DeckItem, transition } from "../DeckItem";
import { AnimationsDirection } from "../types";

export interface DeckLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The animation when the slides are shown.
   **/
  animation?: "slide" | "fade";
  activeIndex?: number;
  direction?: AnimationsDirection;
}

const withBaseName = makePrefixer("uitkDeckLayout");

export const DeckLayout = forwardRef<HTMLDivElement, DeckLayoutProps>(
  function DeckLayout(
    {
      animation,
      children,
      className,
      activeIndex = 0,
      direction = "horizontal",
      ...rest
    },
    ref
  ) {
    const containerRef = useRef<number | undefined>(activeIndex);
    const [transition, setTransition] = useState<transition>("increase");
    const decksCount = Children.count(children);

    useEffect(() => {
      const decreaseWrapping =
        containerRef.current === 0 && activeIndex === decksCount - 1;
      const increaseWrapping =
        containerRef.current === decksCount - 1 && activeIndex === 0;
      const decreaseMove =
        containerRef.current &&
        containerRef.current > activeIndex &&
        !increaseWrapping;
      if (decreaseMove || decreaseWrapping) {
        setTransition("decrease");
      } else {
        setTransition("increase");
      }
      containerRef.current = activeIndex;
    }, [activeIndex]);

    return (
      <GridLayout
        className={cx(withBaseName(), className)}
        columns={1}
        rows={1}
        ref={ref}
        {...rest}
      >
        {Children.map(children, (child, index) => {
          return (
            <DeckItem
              animation={animation}
              direction={direction}
              transition={transition}
              position={
                activeIndex === index
                  ? "current"
                  : activeIndex < index
                  ? "next"
                  : "previous"
              }
            >
              {child}
            </DeckItem>
          );
        })}
      </GridLayout>
    );
  }
);
