import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useMemo, useRef } from "react";
import type { LayoutAnimation } from "../deck-layout";

import deckItemCss from "./DeckItem.css";

const withBaseName = makePrefixer("saltDeckItem");

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
      id: idProp,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-deck-item",
      css: deckItemCss,
      window: targetWindow,
    });

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

    const id = useId(idProp);

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(`${animation ? animation : "static"}-${position}`),
          {
            [withBaseName(getActiveClasses[classesIndex])]:
              animation === "fade",
          },
          className,
        )}
        ref={useForkRef(ref, sliderRef)}
        role={role}
        tabIndex={isCurrent ? 0 : -1}
        id={id}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
