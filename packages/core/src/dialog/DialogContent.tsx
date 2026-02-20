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
  useIsomorphicLayoutEffect,
  useResizeObserver,
} from "../utils";
import dialogContentCss from "./DialogContent.css";
import { useDialogContext } from "./DialogContext";

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
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(true);
    const [isOverflowingVertically, setIsOverflowingVertically] =
      useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
      targetWindow?.requestAnimationFrame(() => {
        const container = divRef.current;
        if (!container) return;
        setCanScrollUp(container.scrollTop > 0);
        setCanScrollDown(
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight >
            1,
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
      setIsOverflowingVertically(
        divRef.current.scrollHeight > divRef.current.offsetHeight,
      );
      setIsOverflowing(
        divRef.current.scrollWidth > divRef.current.offsetWidth ||
          divRef.current.scrollHeight > divRef.current.offsetHeight,
      );
    }, []);

    useResizeObserver({ ref: divRef, onResize: checkOverflow });

    useIsomorphicLayoutEffect(() => {
      checkOverflow();
    }, [checkOverflow]);

    const { contentScrollId, id: headerId } = useDialogContext();

    const overflowProps = isOverflowing
      ? {
          role: "region",
          tabIndex: 0,
          "aria-labelledby": headerId ?? contentScrollId,
        }
      : {};

    return (
      <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
        <div
          onScrollCapture={handleScroll}
          ref={divRef}
          className={clsx(withBaseName("inner"), {
            [withBaseName("overflow")]: isOverflowingVertically,
            [withBaseName("scrollTop")]: isOverflowingVertically && canScrollUp,
            [withBaseName("scrollBottom")]:
              isOverflowingVertically && canScrollDown,
          })}
          {...overflowProps}
        >
          {children}
        </div>
      </div>
    );
  },
);
