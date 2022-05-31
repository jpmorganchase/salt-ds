import { forwardRef, HTMLAttributes, useEffect, useMemo, useRef } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./DeckItem.css";
import cx from "classnames";
import {
  LayoutAnimation,
  LayoutAnimationDirection,
  LayoutAnimationTransition,
} from "../types";

const usePrevious = (value: number) => {
  const ref = useRef(0);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const withBaseName = makePrefixer("uitkDeckItem");

export interface DeckItemProps extends HTMLAttributes<HTMLDivElement> {
  activeIndex: number;
  animation?: LayoutAnimation;
  direction?: LayoutAnimationDirection;
  index: number;
  role?: string;
  transition?: LayoutAnimationTransition;
}

const animationDirections = {
  vertical: ["top", "bottom"],
  horizontal: ["left", "right"],
};

export const DeckItem = forwardRef<HTMLDivElement, DeckItemProps>(
  function DeckItem(
    {
      activeIndex,
      animation,
      children,
      className,
      direction,
      index,
      role = "group",
      transition,
      ...rest
    },
    ref
  ) {
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const lastActive = usePrevious(activeIndex);
    const position = useMemo(() => {
      return activeIndex === index
        ? "current"
        : activeIndex < index
        ? "next"
        : "previous";
    }, [activeIndex]);

    useEffect(() => {
      if (animation && lastActive !== activeIndex && lastActive === index) {
        const exitingSlider = sliderRef.current;
        if (exitingSlider) {
          exitingSlider.setAttribute("data-closing", "");
          exitingSlider.addEventListener(
            "animationend",
            () => {
              exitingSlider.removeAttribute("data-closing");
            },
            { once: true }
          );
        }
      }
    }, [position]);

    const getActiveClasses = () => {
      const currentDirections = direction ? animationDirections[direction] : [];
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

    const classesIndex = animation && position === "current" ? 0 : 1;
    const animationClass = getActiveClasses()[classesIndex];

    // TODO: add aria attributes (labelledby, roledescription, hidden)
    return (
      <div
        className={cx(
          className,
          withBaseName(),
          withBaseName(position),
          withBaseName(animationClass)
        )}
        ref={sliderRef}
        role={role}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
