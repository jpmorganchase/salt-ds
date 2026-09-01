import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type UIEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  makePrefixer,
  useIsomorphicLayoutEffect,
  useResizeObserver,
} from "../utils";
import drawerContentCss from "./DrawerContent.css";
import { useDrawerContext } from "./DrawerContext";

const withBaseName = makePrefixer("saltDrawerContent");

export type DrawerContentProps = ComponentPropsWithoutRef<"div">;

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(props, ref) {
    const { children, className, onScrollCapture, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer-content",
      css: drawerContentCss,
      window: targetWindow,
    });

    const { drawerId, headerId } = useDrawerContext();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const readScrollPosition = useCallback(() => {
      const container = scrollRef.current;
      if (!container) return;

      const overflowingY = container.scrollHeight > container.clientHeight;
      setIsOverflowing(
        overflowingY || container.scrollWidth > container.clientWidth,
      );
      setCanScrollUp(overflowingY && container.scrollTop > 0);
      setCanScrollDown(
        overflowingY &&
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight >
            1,
      );
    }, []);

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
      targetWindow?.requestAnimationFrame(readScrollPosition);
      onScrollCapture?.(event);
    };

    useResizeObserver({ ref: scrollRef, onResize: readScrollPosition });

    useIsomorphicLayoutEffect(() => {
      readScrollPosition();
    }, [readScrollPosition]);

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        <div
          ref={scrollRef}
          className={clsx(withBaseName("inner"), {
            [withBaseName("scrollTop")]: canScrollUp,
            [withBaseName("scrollBottom")]: canScrollDown,
          })}
          onScrollCapture={handleScroll}
          {...(isOverflowing && {
            tabIndex: 0,
            role: "region",
            "aria-labelledby": headerId ?? drawerId,
          })}
        >
          {children}
        </div>
      </div>
    );
  },
);
