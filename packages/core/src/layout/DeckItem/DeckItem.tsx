import cx from "classnames";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { makePrefixer, useForkRef } from "../../utils";
import { LayoutAnimation } from "../types";
import "./DeckItem.css";

const withBaseName = makePrefixer("uitkDeckItem");

export interface DeckItemProps extends HTMLAttributes<HTMLDivElement> {
  activeIndex?: number;
  animation?: LayoutAnimation;
  index: number;
  role?: string;
}

export const DeckItem = forwardRef<HTMLDivElement, DeckItemProps>(
  function DeckItem(
    {
      activeIndex = 0,
      animation,
      children,
      className,
      index,
      role = "group",
      ...rest
    },
    ref
  ) {
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const position = useMemo(() => {
      return activeIndex === index
        ? "current"
        : activeIndex < index
        ? "next"
        : "previous";
    }, [activeIndex, index]);

    const classesIndex = animation && position === "current" ? 0 : 1;

    const getActiveClasses = [
      `${animation || "fade"}-in`, // in-right
      `${animation || "fade"}-out`, // out-left
    ];

    // TODO: add aria attributes (labelledby, roledescription, hidden)
    return (
      <div
        className={cx(
          withBaseName(),
          withBaseName(`${animation ? animation : "static"}-${position}`),
          {
            [withBaseName(getActiveClasses[classesIndex])]:
              animation === "fade",
          },
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
