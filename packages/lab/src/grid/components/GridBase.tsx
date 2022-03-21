import "./Grid.css";
import {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  WheelEventHandler,
} from "react";
import { CellMeasure } from "./CellMeasure";
import { Scrollable } from "./Scrollable";
import { MiddlePart } from "./MiddlePart";
import { TopPart } from "./TopPart";
import { BottomPart } from "./BottomPart";
import { LeftPart } from "./LeftPart";
import { RightPart } from "./RightPart";
import { TopLeftPart } from "./TopLeftPart";
import { TopRightPart } from "./TopRightPart";
import { BottomLeftPart } from "./BottomLeftPart";
import { BottomRightPart } from "./BottomRightPart";
import { useGridContext } from "../GridContext";
import { ColumnDropTarget } from "./ColumnDropTarget";
import { MovingColumn } from "./MovingColumn";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGrid");

export interface GridBaseProps<T> {}

export function GridBase<T>(props: GridBaseProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { model } = useGridContext();

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      model.onKeyDown(event);
    },
    []
  );

  useEffect(() => {
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      model.resize({ width: rect.width, height: rect.height });
    }
  }, [rootRef.current]);

  // All parts should scroll together. This handler is passed to every part of
  // the table responsive to scrolling.
  const onWheel: WheelEventHandler<HTMLTableElement> = useCallback((event) => {
    const scrollerDiv = scrollableRef.current;
    if (!scrollerDiv) {
      return;
    }
    scrollerDiv.scrollLeft += event.deltaX;
    scrollerDiv.scrollTop += event.deltaY;
  }, []);

  return (
    <div
      className={withBaseName()}
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-name="grid-root"
    >
      <CellMeasure />
      <Scrollable
        scrollerRef={scrollableRef}
        topRef={topRef}
        rightRef={rightRef}
        bottomRef={bottomRef}
        leftRef={leftRef}
        middleRef={middleRef}
      />
      <MiddlePart middleRef={middleRef} onWheel={onWheel} />
      <TopPart topRef={topRef} onWheel={onWheel} />
      <BottomPart bottomRef={bottomRef} onWheel={onWheel} />
      <LeftPart leftRef={leftRef} onWheel={onWheel} />
      <RightPart rightRef={rightRef} onWheel={onWheel} />
      <TopLeftPart onWheel={onWheel} />
      <TopRightPart onWheel={onWheel} />
      <BottomLeftPart onWheel={onWheel} />
      <BottomRightPart onWheel={onWheel} />
      <ColumnDropTarget />
      <MovingColumn />
    </div>
  );
}
