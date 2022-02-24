import {
  useCallback,
  useRef,
  useState,
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent,
} from "react";
import cx from "classnames";
import { Button } from "@brandname/core";

import "./DraggableSnapshot.css";

const classBase = "uitkDraggableSnapshot";

const Shift: Record<string, string> = {
  true: "Shift",
  false: "",
};

const Move: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ShiftArrowLeft: [-10, 0],
  ShiftArrowRight: [10, 0],
  ShiftArrowUp: [0, -10],
  ShiftArrowDown: [0, 10],
};

export const DraggableImg = ({
  src,
  style: styleProp = {},
  targetPosition = { left: 154, top: 100 },
}: {
  src: string;
  style?: CSSProperties;
  targetPosition?: { left: number; top: number };
}) => {
  const [[left, top], setPosition] = useState([20, 20]);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentPosition = useRef([left, top]);
  const [opacity, setOpacity] = useState(0.5);
  const lastMousePos = useRef([0, 0]);
  const root = useRef(null);

  const moveSnapshot = useCallback((moveLeft: number, moveTop: number) => {
    const [currentLeft, currentTop] = currentPosition.current;
    const newLeft = currentLeft + moveLeft;
    const newTop = currentTop + moveTop;
    currentPosition.current[0] = newLeft;
    currentPosition.current[1] = newTop;
    setPosition([newLeft, newTop]);
  }, []);

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      const { screenX, screenY } = evt;
      const [lastX, lastY] = lastMousePos.current;
      const xDiff = screenX - lastX;
      const yDiff = screenY - lastY;
      lastMousePos.current[0] = screenX;
      lastMousePos.current[1] = screenY;
      moveSnapshot(xDiff, yDiff);
    },
    [moveSnapshot]
  );

  const handleMouseUp = useCallback(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (evt: ReactMouseEvent) => {
      lastMousePos.current = [evt.screenX, evt.screenY];
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      console.log({ evt });
      const key = `${Shift[evt.shiftKey.toString()]}${evt.key}`;
      console.log({ key });
      const moveBy = Move[key];
      if (moveBy) {
        evt.preventDefault();
        moveSnapshot(...moveBy);
      }
    },
    [moveSnapshot]
  );

  const alignImages = useCallback(() => {
    currentPosition.current = [targetPosition.left, targetPosition.top - 120];
    setPosition([targetPosition.left, targetPosition.top - 120]);
    setIsAnimating(true);
  }, [targetPosition]);

  const toggleOpacity = useCallback(() => {
    setOpacity((value) => (value === 1 ? 0.5 : 1));
  }, []);

  const handleTransitionEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const style = {
    ...styleProp,
    "--uitkDraggableSnapshot-opacity": opacity,
    "--uitkDraggableSnapshot-url": `url(${src})`,
    left,
    top,
  };

  return (
    <div
      className={cx(classBase, {
        [`${classBase}-sliding`]: isAnimating,
      })}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onTransitionEnd={handleTransitionEnd}
      ref={root}
      style={style}
      tabIndex={0}
    >
      <div className={`${classBase}-header`}>
        <div className={`${classBase}-actions`}>
          <Button variant="primary" onClick={alignImages}>
            Align Images
          </Button>
          <Button variant="primary" onClick={toggleOpacity}>
            Toggle Opacity
          </Button>
        </div>
      </div>
      <div className={`${classBase}-img`} />
    </div>
  );
};
