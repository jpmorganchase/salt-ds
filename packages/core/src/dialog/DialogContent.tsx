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
    const {
      children,
      className,
      "aria-labelledby": ariaLabelledBy,
      role,
      tabIndex,
      ...rest
    } = props;
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(true);
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
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.offsetHeight,
      );
    }, []);

    useResizeObserver({ ref: divRef, onResize: checkOverflow });

    useIsomorphicLayoutEffect(() => {
      checkOverflow();
    }, [checkOverflow]);

    const { id: dialogId } = useDialogContext();

    const overflowProps = isOverflowing
      ? {
          role: role ?? "region",
          tabIndex: tabIndex ?? 0,
          ...(ariaLabelledBy === undefined && {
            "aria-labelledby": dialogId,
          }),
          ...(ariaLabelledBy !== undefined && {
            "aria-labelledby": ariaLabelledBy ?? dialogId,
          }),
        }
      : {
          role,
          tabIndex,
          "aria-labelledby": ariaLabelledBy,
        };

    return (
      <div
        className={clsx(withBaseName(), className)}
        {...overflowProps}
        {...rest}
        ref={ref}
      >
        <div
          onScrollCapture={handleScroll}
          ref={divRef}
          className={clsx(withBaseName("inner"), {
            [withBaseName("overflow")]: isOverflowing,
            [withBaseName("scrollTop")]: isOverflowing && canScrollUp,
            [withBaseName("scrollBottom")]: isOverflowing && canScrollDown,
          })}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);
