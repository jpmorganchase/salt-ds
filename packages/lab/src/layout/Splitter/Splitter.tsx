import {
  forwardRef,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
  CSSProperties,
} from "react";
import cx from "classnames";

import "./Splitter.css";
import { makePrefixer } from "@brandname/core";

const classBase = "uitkSplitter";
const withBaseName = makePrefixer(classBase);

type SplitterProps = {
  column: any;
  index: number;
  onDrag: (index: number, distance: number) => void;
  onDragEnd: (event?: SyntheticEvent | Event) => void;
  onDragStart: (event: SyntheticEvent | Event | number) => void;
  style?: CSSProperties;
};

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(
  function Splitter(
    { column, index, onDrag, onDragEnd, onDragStart, style },
    ref
  ) {
    const ignoreClick = useRef<boolean>(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const lastPos = useRef<number>(0);

    const [active, setActive] = useState(false);

    const handleKeyDownDrag = useCallback(
      ({ key, shiftKey }) => {
        // TODO calc max distance
        const distance = shiftKey ? 10 : 1;
        if (column && key === "ArrowDown") {
          onDrag(index, distance);
        } else if (column && key === "ArrowUp") {
          onDrag(index, -distance);
        } else if (!column && key === "ArrowLeft") {
          onDrag(index, -distance);
        } else if (!column && key === "ArrowRight") {
          onDrag(index, distance);
        }
      },
      [column, index, onDrag]
    );

    const handleKeyDownInitDrag = useCallback(
      (evt) => {
        const { key } = evt;
        const horizontalMove = key === "ArrowLeft" || key === "ArrowRIght";
        const verticalMove = key === "ArrowUp" || key === "ArrowDown";
        if ((column && verticalMove) || (!column && horizontalMove)) {
          onDragStart(index);
          handleKeyDownDrag(evt);
          keyDownHandlerRef.current = handleKeyDownDrag;
        }
      },
      [column, handleKeyDownDrag, index, onDragStart]
    );

    const keyDownHandlerRef = useRef(handleKeyDownInitDrag);
    const handleKeyDown = (evt: any) => keyDownHandlerRef.current(evt);

    const handleMouseMove = useCallback(
      (e) => {
        ignoreClick.current = true;
        const pos = e[column ? "clientY" : "clientX"];
        const diff = pos - lastPos.current;
        // we seem to get a final value of zero
        if (pos && pos !== lastPos.current) {
          onDrag(index, diff);
        }
        lastPos.current = pos;
      },
      [column, index, onDrag]
    );

    const handleMouseUp = useCallback(() => {
      window.removeEventListener("mousemove", handleMouseMove, false);
      window.removeEventListener("mouseup", handleMouseUp, false);
      onDragEnd();
      setActive(false);
      rootRef.current?.focus();
    }, [handleMouseMove, onDragEnd, setActive]);

    const handleMouseDown = useCallback(
      (e) => {
        lastPos.current = column ? e.clientY : e.clientX;
        onDragStart(index);
        window.addEventListener("mousemove", handleMouseMove, false);
        window.addEventListener("mouseup", handleMouseUp, false);
        e.preventDefault();
        setActive(true);
      },
      [column, handleMouseMove, handleMouseUp, index, onDragStart, setActive]
    );

    const handleFocus = () => {
      // TODO
    };

    const handleClick = () => {
      if (ignoreClick.current) {
        ignoreClick.current = false;
      } else {
        rootRef.current?.focus();
      }
    };

    const handleBlur = () => {
      // TODO
      keyDownHandlerRef.current = handleKeyDownInitDrag;
    };

    const className = cx("Splitter", "focusable", { active, column });

    return (
      <div
        className={cx(className, withBaseName(), withBaseName("focusable"), {
          [`${classBase}-active`]: active,
          [`${classBase}-column`]: column,
        })}
        data-splitter
        ref={rootRef}
        role="separator"
        style={style}
        onBlur={handleBlur}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        tabIndex={0}
      >
        <div className={withBaseName("grabZone")} />
      </div>
    );
  }
);
