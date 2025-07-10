import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
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
import overlayPanelContentCss from "./OverlayPanelContent.css";

const withBaseName = makePrefixer("saltOverlayPanelContent");

export interface OverlayPanelContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Overlay Panel Content
   */
  children?: ReactNode;
}

export const OverlayPanelContent = forwardRef<
  HTMLDivElement,
  OverlayPanelContentProps
>(function OverlayPanelContent(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-panel-content",
    css: overlayPanelContentCss,
    window: targetWindow,
  });

  const { children, className, ...rest } = props;
  const [scrollBarTop, setScrollBarTop] = useState(false);
  const [scrollBarBottom, setScrollBarBottom] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(divRef, ref);
  const handleScroll = debounce(() => {
    const container = divRef.current;
    if (!container) return;
    setScrollBarTop(container.scrollTop > 0);
    setScrollBarBottom(
      container.scrollHeight - container.scrollTop - container.clientHeight !==
        0,
    );
  });

  const checkOverflow = useCallback(() => {
    if (!divRef.current) return;
    setIsOverflowing(
      divRef.current.scrollHeight > divRef.current.offsetHeight + 1, // var(--salt-size-thickness-100)
    );
  }, []);

  useResizeObserver({ ref: divRef, onResize: checkOverflow });

  useIsomorphicLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow]);

  return (
    <div className={clsx(withBaseName(), className)}>
      <div
        className={clsx(withBaseName("container"), {
          [withBaseName("overflow")]: isOverflowing,
          [withBaseName("scroll-top")]: isOverflowing && scrollBarTop,
          [withBaseName("scroll-bottom")]: isOverflowing && scrollBarBottom,
        })}
        onScrollCapture={handleScroll}
        {...rest}
        ref={containerRef}
      >
        {children}
      </div>
    </div>
  );
});
