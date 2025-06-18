import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useState,
} from "react";
import { DeckItem, type DeckItemProps } from "../deck-item";
import { useWidth } from "../responsive";

import deckLayoutCss from "./DeckLayout.css";

export type LayoutAnimation = "slide" | "fade";
export type LayoutAnimationDirection = "horizontal" | "vertical";
export type LayoutAnimationTransition = "increase" | "decrease";

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
  /**
   * Props to be passed to the DeckItem component.
   */
  deckItemProps?: Partial<DeckItemProps>;
}

const withBaseName = makePrefixer("saltDeckLayout");

export const DeckLayout = forwardRef<HTMLDivElement, DeckLayoutProps>(
  function DeckLayout(
    {
      activeIndex = 0,
      animation,
      className,
      children,
      direction = "horizontal",
      style,
      deckItemProps,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-deck-layout",
      css: deckLayoutCss,
      window: targetWindow,
    });

    const [deckItemRef, deckItemWidth] = useWidth<HTMLDivElement>(true);

    const [deckItemHeight, setDeckItemHeight] = useState<number>(0);

    const handleResize = useCallback(function handleResize(
      contentRect: DOMRect,
    ) {
      setDeckItemHeight(contentRect.height);
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (!deckItemRef.current) {
        return undefined;
      }

      handleResize(deckItemRef.current.getBoundingClientRect());

      const observer = new ResizeObserver(
        ([{ contentRect }]: ResizeObserverEntry[]) => {
          handleResize(contentRect);
        },
      );
      observer.observe(deckItemRef.current);

      return () => {
        observer.disconnect();
      };
    }, [deckItemRef, handleResize]);

    const deckLayoutStyles = {
      ...style,
      "--deckLayout-width": `${deckItemWidth}px`,
      "--deckLayout-height": `${deckItemHeight}px`,
    };

    const innerStyles = {
      "--deckLayout-transform-value": `-${activeIndex * 100}%`,
    } as CSSProperties;

    return (
      <div
        className={clsx(withBaseName(), className)}
        style={deckLayoutStyles}
        ref={ref}
        {...rest}
      >
        <div
          className={clsx(
            {
              [withBaseName("animate")]: animation,
            },
            {
              [withBaseName(`${animation || "slide"}-${direction}`)]: animation,
            },
          )}
          style={innerStyles}
        >
          {Children.map(children, (child, index) => {
            return (
              <DeckItem
                ref={deckItemRef}
                index={index}
                activeIndex={activeIndex}
                animation={animation}
                {...deckItemProps}
              >
                {child}
              </DeckItem>
            );
          })}
        </div>
      </div>
    );
  },
);
