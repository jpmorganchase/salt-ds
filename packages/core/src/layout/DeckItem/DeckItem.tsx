import cx from "classnames";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { makePrefixer, useForkRef, useIdMemo } from "../../utils";
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
      id,
      ...rest
    },
    ref
  ) {
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const isCurrent = activeIndex === index;

    const position = useMemo(() => {
      return isCurrent ? "current" : activeIndex < index ? "next" : "previous";
    }, [activeIndex, index, isCurrent]);

    const classesIndex = animation && position === "current" ? 0 : 1;

    const getActiveClasses = [
      `${animation || "fade"}-in`, // in-right
      `${animation || "fade"}-out`, // out-left
    ];

    const deckItemId = useIdMemo(id);

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
        tabIndex={isCurrent ? 0 : -1}
        id={deckItemId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
