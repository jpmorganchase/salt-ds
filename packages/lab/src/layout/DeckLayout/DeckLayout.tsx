import { Children, forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import { DeckItem } from "../DeckItem";
import "./DeckLayout.css";

import cx from "classnames";
import {
  LayoutAnimation,
  LayoutAnimationDirection,
  LayoutAnimationTransition,
} from "@jpmorganchase/uitk-core/src/layout/types";

export interface DeckLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial item to render.
   **/
  activeIndex?: number;
  /**
   * The animation when the slides are shown.
   **/
  animation?: LayoutAnimation;
  /**
   * The direction in which items will transition.
   **/
  direction?: LayoutAnimationDirection;
  transition?: LayoutAnimationTransition;
}

const withBaseName = makePrefixer("uitkDeckLayout");

export const DeckLayout = forwardRef<HTMLDivElement, DeckLayoutProps>(
  function DeckLayout(
    {
      activeIndex = 0,
      animation,
      className,
      children,
      direction = "horizontal",
      transition,
      ...rest
    },
    ref
  ) {
    const deckItemProps = { animation, direction, transition };
    return (
      <div className={cx(withBaseName(), className)} ref={ref} {...rest}>
        {Children.map(children, (child, index) => {
          return (
            <DeckItem
              {...deckItemProps}
              index={index}
              activeIndex={activeIndex}
              transition={transition}
            >
              {child}
            </DeckItem>
          );
        })}
      </div>
    );
  }
);
