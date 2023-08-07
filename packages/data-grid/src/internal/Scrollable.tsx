import { RefObject, UIEventHandler, useEffect } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import scrollableCss from "./Scrollable.css";

const withBaseName = makePrefixer("saltGridScrollable");

export interface ScrollableProps<T> {
  resizeClient: (params: {
    clientWidth: number;
    clientHeight: number;
    scrollBarWidth: number;
    scrollBarHeight: number;
  }) => void;

  scrollLeft: number;
  scrollTop: number;
  scrollSource: "user" | "table";
  scroll: (left?: number, top?: number, source?: "user" | "table") => void;

  scrollerRef: RefObject<HTMLDivElement>;
  middleRef: RefObject<HTMLDivElement>;
  topRef: RefObject<HTMLDivElement>;
  leftRef: RefObject<HTMLDivElement>;
  rightRef: RefObject<HTMLDivElement>;
  bottomRef: RefObject<HTMLDivElement>;
}

// Provides scrollbars for the grid. Synchronizes scrolling across all parts
// (pinned and unpinned).
export function Scrollable<T>(props: ScrollableProps<T>) {
  const {
    scrollerRef,
    middleRef,
    topRef,
    leftRef,
    rightRef,
    bottomRef,
    resizeClient,
    scrollLeft,
    scrollTop,
    scrollSource,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-scrollable",
    css: scrollableCss,
    window: targetWindow,
  });

  const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
    if (!scrollerRef.current) {
      return;
    }
    const { scrollLeft, scrollTop } = scrollerRef.current;
    const top = topRef.current;
    if (top) {
      top.scrollLeft = scrollLeft;
    }
    const bottom = bottomRef.current;
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
    props.scroll(scrollLeft, scrollTop, "user");
  };

  useEffect(() => {
    if (!scrollerRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { offsetWidth, offsetHeight, clientWidth, clientHeight } =
        entry.target as HTMLDivElement;
      const scrollBarWidth = offsetWidth - clientWidth;
      const scrollBarHeight = offsetHeight - clientHeight;
      resizeClient({
        clientWidth,
        clientHeight,
        scrollBarWidth,
        scrollBarHeight,
      });
    });

    resizeObserver.observe(scrollerRef.current);
    return () => resizeObserver.disconnect();
  }, [resizeClient, scrollerRef]);

  useEffect(() => {
    if (!scrollerRef.current) {
      return;
    }
    if (scrollSource === "table") {
      if (scrollLeft !== scrollerRef.current.scrollLeft) {
        scrollerRef.current.scrollLeft = scrollLeft;
      }
      if (scrollTop !== scrollerRef.current.scrollTop) {
        scrollerRef.current.scrollTop = scrollTop;
      }
    }
  }, [scrollLeft, scrollTop, scrollSource, scrollerRef]);

  return (
    <div
      ref={scrollerRef}
      className={withBaseName()}
      onScroll={onScroll}
      data-testid="grid-scrollable"
    >
      <div className={withBaseName("space")} />
    </div>
  );
}
