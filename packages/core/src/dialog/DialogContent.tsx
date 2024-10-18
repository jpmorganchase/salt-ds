import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  debounce,
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
    const [scrolled, setScrolled] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);
    const containerRef = useForkRef(divRef, ref);
    const handleScroll = debounce(() => {
      if (!divRef.current) return;
      setScrolled(divRef.current.scrollTop > 0);
    });

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
        <div className={clsx({ [withBaseName("scroll")]: scrolled })} />
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
      </>
    );
  },
);
