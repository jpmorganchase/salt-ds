import { useGridContext } from "../GridContext";
import { RefObject, UIEventHandler, useEffect, useMemo, useRef } from "react";
import "./Scrollable.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridScrollable");

export interface ScrollableProps<T> {
  scrollerRef: RefObject<HTMLDivElement>;
  middleRef: RefObject<HTMLDivElement>;
  topRef: RefObject<HTMLDivElement>;
  leftRef: RefObject<HTMLDivElement>;
  rightRef: RefObject<HTMLDivElement>;
  bottomRef: RefObject<HTMLDivElement>;
}

// Renders a scrollable div with a large empty "space" div inside that has the
// size that the entire table would have if it wasn't virtualized.
// The idea is to show the right scrollbars.
// When this component is scrolled it scrolls all other parts accordingly
export function Scrollable<T>(props: ScrollableProps<T>) {
  const { scrollerRef, middleRef, topRef, leftRef, rightRef, bottomRef } =
    props;

  const { model } = useGridContext();
  const totalWidth = model.useTotalWidth();
  const totalHeight = model.useTotalHeight();
  const scrollPosition = model.useScrollPosition();

  const style = useMemo(() => {
    return {
      height: `${totalHeight}px`,
      width: `${totalWidth}px`,
    };
  }, [totalHeight, totalWidth]);

  const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
    if (!scrollerRef.current) {
      return;
    }
    const { scrollLeft, scrollTop } = scrollerRef.current;

    const top = topRef.current;
    const bottom = bottomRef.current;
    if (top) {
      top.scrollLeft = scrollLeft;
    }
    if (bottom) {
      bottom.scrollLeft = scrollLeft;
    }
    const left = leftRef.current;
    if (left) {
      left.scrollTop = scrollTop;
    }
    const right = rightRef.current;
    if (right) {
      right.scrollTop = scrollTop;
    }
    const middle = middleRef.current;
    if (middle) {
      middle.scrollTop = scrollTop;
      middle.scrollLeft = scrollLeft;
    }
    model.scroll({ scrollLeft, scrollTop });
  };

  useEffect(() => {
    if (!scrollerRef.current) {
      return;
    }
    const { scrollLeft, scrollTop, source } = scrollPosition;
    if (source === "model") {
      scrollerRef.current.scrollLeft = scrollLeft;
      scrollerRef.current.scrollTop = scrollTop;
    }
  }, [scrollPosition, scrollerRef.current]);

  return (
    <div ref={scrollerRef} className={withBaseName()} onScroll={onScroll}>
      <div className={withBaseName("space")} style={style} />
    </div>
  );
}
