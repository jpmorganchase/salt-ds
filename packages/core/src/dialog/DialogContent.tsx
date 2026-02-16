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

export interface DialogContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "aria-label" | "aria-labelledby" | "role"
  > {
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
      // @ts-expect-error: "aria-labelledby" is omitted to prevent accidental misuse,
      // but we still want to forward it for advanced accessible labeling scenarios.
      "aria-labelledby": ariaLabelledBy,
      // @ts-expect-error: Allow passing role even though it's omitted from HTMLAttributes
      // Same reasoning as above: we forward role for accessibility purposes.
      role,
      tabIndex,
      ...rest
    } = props;
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

    const { contentScrollId, headerId } = useDialogContext();

    const overflowProps = isOverflowing
      ? {
          role: role ?? "region",
          tabIndex: tabIndex ?? 0,
          ...(ariaLabelledBy === undefined && {
            "aria-labelledby": headerId ?? contentScrollId,
          }),
          ...(ariaLabelledBy !== undefined && {
            "aria-labelledby": ariaLabelledBy ?? headerId ?? contentScrollId,
          }),
        }
      : {
          role,
          tabIndex,
          "aria-labelledby": ariaLabelledBy,
        };

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
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);
