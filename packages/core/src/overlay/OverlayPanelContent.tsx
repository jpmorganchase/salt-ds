import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
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
  const [scrolled, setScrolled] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(divRef, ref);
  const handleScroll = debounce(() => {
    if (!divRef.current) return;
    setScrolled(divRef.current.scrollTop > 0);
  }, 50);

  const checkOverflow = useCallback(() => {
    if (!divRef.current) return;
    setIsOverflowing(divRef.current.scrollHeight > divRef.current.offsetHeight);
  }, []);

  useResizeObserver({ ref: divRef, onResize: checkOverflow });

  useIsomorphicLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow]);
  return (
    <>
      <div
        className={clsx(withBaseName("separator"), {
          [withBaseName("scroll")]: scrolled,
        })}
      />
      <div className={clsx(withBaseName("container"))}>
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
      </div>
    </>
  );
});
