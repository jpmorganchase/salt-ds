import { CSSProperties, forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { GridItem } from "../GridItem";

import { makePrefixer } from "@brandname/core";
import { GridAlignment, AnimationsDirection } from "../types";
import "./DeckItem.css";

export type transition = "increase" | "decrease";

export interface DeckItemProps extends HTMLAttributes<HTMLDivElement> {
  animation?: "slide" | "fade";
  current: boolean;
  direction?: AnimationsDirection;
  /**
   * The className(s) of the component.
   */
  className?: string;

  /**
   * Aligns a grid item inside a cell along the inline (row) axis
   */
  justify?: GridAlignment;
  /**
   * Aligns a grid item inside a cell along the block (column) axis
   */
  align?: GridAlignment;
  transition: transition;
  /**
   * Custom styles
   */
  style?: CSSProperties;
}

const withBaseName = makePrefixer("uitkDeckItem");

export const DeckItem = forwardRef<HTMLDivElement, DeckItemProps>(
  function DeckItem(
    { animation, current, children, className, direction, transition, ...rest },
    ref
  ) {
    const getActiveClasses = () => {
      const directions = {
        vertical: ["top", "bottom"],
        horizontal: ["left", "right"],
      };
      const currentDirections = direction ? directions[direction] : [];
      const getCurrentMove = (index: number) =>
        animation === "fade" ? "" : `-${currentDirections[index]}`;
      return transition === "decrease"
        ? [
            `${animation}-in${getCurrentMove(0)}`,
            `${animation}-out${getCurrentMove(1)}`,
          ]
        : [
            `${animation}-in${getCurrentMove(1)}`,
            `${animation}-out${getCurrentMove(0)}`,
          ];
    };

    const animationClass =
      animation && current ? getActiveClasses()[0] : getActiveClasses()[1];
    return (
      <GridItem
        className={cx(
          withBaseName(),
          current && withBaseName("current"),
          withBaseName(animationClass),
          !current && withBaseName("hidden")
        )}
        colStart={1}
        colEnd={2}
        rowStart={1}
        rowEnd={2}
        ref={ref}
        {...rest}
      >
        {children}
      </GridItem>
    );
  }
);
