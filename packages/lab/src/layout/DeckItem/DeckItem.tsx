import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./DeckItem.css";
import cx from "classnames";
import {
  LayoutAnimation,
  LayoutAnimationDirection,
  LayoutAnimationTransition,
} from "@jpmorganchase/uitk-core/src/layout/types";
import { useForkRef, usePrevious } from "../../utils";

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
    const lastActive = usePrevious(activeIndex, [activeIndex]);
    const [animationClass, setAnimationClass] = useState("");
    const position = useMemo(() => {
      return activeIndex === index
        ? "current"
        : activeIndex < index
        ? "next"
        : "previous";
    }, [activeIndex]);

    const staticPosition =
      index === 1 ? "current" : index === 2 ? "next" : "previous";

    const currentDirections = direction ? animationDirections[direction] : [];
    const classesIndex = animation && position === "current" ? 0 : 1;

    useEffect(() => {
      if (lastActive === undefined && index === activeIndex) return;
      // ENTRANCE ANIMATION
      if (animation && lastActive !== activeIndex) {
        setAnimationClass(getActiveClasses()[classesIndex]);
      }
      // EXIT ANIMATION
      if (
        animationClass &&
        animation &&
        lastActive !== activeIndex &&
        lastActive === index
      ) {
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
    }, [activeIndex]);

    const getActiveClasses = () => {
      const getCurrentMove = (index: number) =>
        animation === "fade" ? "" : `-${currentDirections[index]}`;
      return transition === "decrease"
        ? [
            `${animation}-in${getCurrentMove(0)}`, // in-left
            `${animation}-out${getCurrentMove(1)}`, // out-right
          ]
        : [
            `${animation}-in${getCurrentMove(1)}`, // in-right
            `${animation}-out${getCurrentMove(0)}`, //out-left
          ];
    };

    // TODO: add aria attributes (labelledby, roledescription, hidden)
    return (
      <div
        className={cx(
          withBaseName(),
          withBaseName(position),
          { [withBaseName(animationClass)]: animationClass },
          className
        )}
        ref={useForkRef(ref, sliderRef)}
        role={role}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
