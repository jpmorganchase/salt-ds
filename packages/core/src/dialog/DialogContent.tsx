import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  makePrefixer,
  useForkRef,
  useIsomorphicLayoutEffect,
  useResizeObserver,
} from "../utils";

import dialogContentCss from "./DialogContent.css";

const withBaseName = makePrefixer("saltDialogContent");

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of Dialog Content
   */
  children?: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { children, className, ...rest } = props;
    const [scrolledTop, setScrolledTop] = useState(false);
    const [scrolledBottom, setScrolledBottom] = useState(true);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);
    const containerRef = useForkRef(divRef, ref);

    const handleScroll = () => {
      targetWindow?.requestAnimationFrame(() => {
        const container = divRef.current;
        if (!container) return;
        setScrolledTop(container.scrollTop > 0);
        setScrolledBottom(
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight !==
            0,
        );
      });
    };

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-content",
      css: dialogContentCss,
      window: targetWindow,
    });

    const checkOverflow = useCallback(() => {
      if (!divRef.current) return;
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.offsetHeight,
      );
    }, []);

    useResizeObserver({ ref: divRef, onResize: checkOverflow });

    useIsomorphicLayoutEffect(() => {
      checkOverflow();
    }, [checkOverflow]);

    return (
      <>
        <div
          className={clsx({
            [withBaseName("scroll")]: isOverflowing && scrolledTop,
          })}
        />
        <div
          className={clsx(
            withBaseName(),
            {
              [withBaseName("overflow")]: isOverflowing,
            },
            className,
          )}
          onScrollCapture={handleScroll}
          {...rest}
          ref={containerRef}
        >
          {children}
        </div>
        <div
          className={clsx({
            [withBaseName("scroll")]: isOverflowing && scrolledBottom,
          })}
        />
      </>
    );
  },
);
