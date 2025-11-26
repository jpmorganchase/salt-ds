import { useIsomorphicLayoutEffect, useResizeObserver } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import "./ContentOverflow.css";

export const ContentOverflow = ({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) => {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    requestAnimationFrame(() => {
      const container = divRef.current;
      if (!container) return;
      setCanScrollUp(container.scrollTop > 0);
      setCanScrollDown(
        container.scrollHeight - container.scrollTop - container.clientHeight >
          1,
      );
    });
  };

  const checkOverflow = useCallback(() => {
    if (!divRef.current) return;
    setIsOverflowing(divRef.current.scrollHeight > divRef.current.offsetHeight);
  }, []);

  useResizeObserver({ ref: divRef, onResize: checkOverflow });

  useIsomorphicLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow]);

  const withBaseName = (name = "") =>
    `overflowContent${name ? `-${name}` : ""}`;

  return (
    <div className={clsx(withBaseName, className)}>
      <div
        style={style}
        onScrollCapture={handleScroll}
        ref={divRef}
        className={clsx(withBaseName("inner"), {
          [withBaseName("scrollTop")]: isOverflowing && canScrollUp,
          [withBaseName("scrollBottom")]: isOverflowing && canScrollDown,
        })}
      >
        {children}
      </div>
    </div>
  );
};
