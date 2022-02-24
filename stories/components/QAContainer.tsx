import {
  forwardRef,
  CSSProperties,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { DraggableImg } from "./DraggableSnapshot";

import "./QAContainer.css";

export interface QAContainerProps extends HTMLAttributes<HTMLDivElement> {
  height?: number;
  imgSrc: string;
  width?: number;
}

export const QAContainer = forwardRef<HTMLDivElement, QAContainerProps>(
  function QAContainer(
    {
      children,
      className,
      height = 600,
      imgSrc,
      style: styleProp,
      width = 850,
    },
    forwardedRef
  ) {
    const [containerPos, setContainerPos] = useState({ left: 20, top: 150 });
    const container = useRef<HTMLDivElement>(null);

    const computePosition = useCallback(() => {
      if (container.current) {
        const { left, top } = container.current.getBoundingClientRect();
        setContainerPos({ left, top });
      }
    }, []);

    useEffect(() => {
      window.addEventListener("resize", computePosition);
      return () => {
        window.removeEventListener("resize", computePosition);
      };
    }, []);

    useEffect(computePosition, [computePosition]);

    const style = {
      "--uitkDraggableSnapshot-img-height": `${height}px`,
      "--uitkDraggableSnapshot-img-width": `${width}px`,
    } as CSSProperties;

    return (
      <div className={cx("uitkQAContainer", className)} style={styleProp}>
        <div className="uitkQAContainer-content" ref={container}>
          {children}
        </div>
        <DraggableImg
          src={imgSrc}
          style={style}
          targetPosition={containerPos}
        />
      </div>
    );
  }
);
