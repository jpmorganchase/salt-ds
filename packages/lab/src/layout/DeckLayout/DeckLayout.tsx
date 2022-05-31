import {
  Children,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  LayoutAnimation,
  LayoutAnimationDirection,
  LayoutAnimationTransition,
} from "../types";
import { DeckItem } from "../DeckItem";
import "./DeckLayout.css";

import cx from "classnames";

export interface DeckLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The animation when the slides are shown.
   **/
  animation?: LayoutAnimation;
  /**
   * The initial item to render.
   **/
  activeIndex?: number;
  /**
   * The direction in which items will transition.
   **/
  direction?: LayoutAnimationDirection;
  loadOffsetChildren?: "immediate" | "all" | false;
}

const withBaseName = makePrefixer("uitkDeckLayout");

export const DeckLayout = forwardRef<HTMLDivElement, DeckLayoutProps>(
  function DeckLayout(
    {
      activeIndex = 0,
      animation,
      className,
      children,
      // loadChildren,
      direction = "horizontal",
      ...rest
    },
    ref
  ) {
    const containerRef = useRef<number>(activeIndex | 0);
    const [transition, setTransition] =
      useState<LayoutAnimationTransition>("increase");
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
      containerRef.current = activeIndex | 0;
    }, [activeIndex, decksCount]);

    return (
      <div className={cx(withBaseName(), className)} ref={ref} {...rest}>
        {Children.map(children, (child, index) => {
          return (
            <DeckItem
              animation={animation}
              direction={direction}
              transition={transition}
              index={index}
              activeIndex={activeIndex}
            >
              {child}
            </DeckItem>
          );
        })}
      </div>
    );
  }
);
