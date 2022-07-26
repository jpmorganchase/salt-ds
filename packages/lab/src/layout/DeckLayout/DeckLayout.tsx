import {
  Children,
  forwardRef,
  HTMLAttributes,
  useState,
  useCallback,
  CSSProperties,
} from "react";
import {
  makePrefixer,
  LayoutAnimation,
  LayoutAnimationDirection,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";

import { DeckItem } from "../DeckItem";
import { useWidth } from "../../responsive";
import "./DeckLayout.css";

import cx from "classnames";

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
      style,
      ...rest
    },
    ref
  ) {
    const [deckItemRef, deckItemWidth] = useWidth<HTMLDivElement>(true);

    const [deckItemHeight, setDeckItemHeight] = useState<number>();

    const handleResize = useCallback(function handleResize(
      contentRect: DOMRect
    ) {
      setDeckItemHeight(contentRect.height);
    },
    []);

    useIsomorphicLayoutEffect(() => {
      if (!deckItemRef.current) {
        return undefined;
      }

      handleResize(deckItemRef.current.getBoundingClientRect());

      const observer = new ResizeObserver(
        ([{ contentRect }]: ResizeObserverEntry[]) => {
          handleResize(contentRect);
        }
      );
      observer.observe(deckItemRef.current);

      return () => {
        observer.disconnect();
      };
    }, [deckItemRef, handleResize]);

    const deckLayoutStyles = {
      ...style,
      "--deck-layout-width": `${deckItemWidth}px`,
      "--deck-layout-height": `${deckItemHeight}px`,
    };

    const innerStyles = {
      "--deck-layout-transform-value": `-${activeIndex * 100}%`,
    } as CSSProperties;

    return (
      <div
        className={cx(withBaseName(), className)}
        style={deckLayoutStyles}
        ref={ref}
        {...rest}
      >
        <div
          className={cx(
            {
              [withBaseName("animate")]: animation,
            },
            {
              [withBaseName(`${animation}-${direction}`)]: animation,
            }
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
              >
                {child}
              </DeckItem>
            );
          })}
        </div>
      </div>
    );
  }
);
