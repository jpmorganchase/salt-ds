import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { makePrefixer, useForkRef } from "@jpmorganchase/uitk-core";
import "./DeckItem.css";
import cx from "classnames";
import { LayoutAnimation } from "@jpmorganchase/uitk-core/src/layout/types";

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
    }, [activeIndex]);

    const classesIndex = animation && position === "current" ? 0 : 1;

    const getActiveClasses = [
      `${animation}-in`, // in-right
      `${animation}-out`, // out-left
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
