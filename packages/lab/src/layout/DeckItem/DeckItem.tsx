import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { GridItem } from "../GridItem";

import { makePrefixer } from "@brandname/core";
import { AnimationsDirection, GridAlignment } from "../types";
import "./DeckItem.css";

export type transition = "increase" | "decrease";

export interface DeckItemProps extends HTMLAttributes<HTMLDivElement> {
  animation?: "slide" | "fade";
  direction?: AnimationsDirection;
  /**
   * Aligns a grid item inside a cell along the inline (row) axis
   */
  justify?: GridAlignment;
  /**
   * Aligns a grid item inside a cell along the block (column) axis
   */
  align?: GridAlignment;
  transition: transition;
  position: "current" | "previous" | "next";
}

const withBaseName = makePrefixer("uitkDeckItem");

export const DeckItem = forwardRef<HTMLDivElement, DeckItemProps>(
  function DeckItem(
    {
      animation,
      children,
      className,
      direction,
      position,
      transition,
      ...rest
    },
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

    const current = position === "current";

    const animationClass =
      animation && current ? getActiveClasses()[0] : getActiveClasses()[1];
    return (
      <GridItem
        className={cx(
          withBaseName(),
          withBaseName(position),
          withBaseName(animationClass)
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
