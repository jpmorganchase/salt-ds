import { Button, makePrefixer, useIcon, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import sidePanelContentCss from "./SidePanelContent.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanelContent");

export interface SidePanelContentProps extends ComponentPropsWithRef<"div"> {
  /**
   * Content rendered in the header area next to the close button.
   */
  header?: ReactNode;
}

export const SidePanelContent = forwardRef<
  HTMLDivElement,
  SidePanelContentProps
>(function SidePanelContent(props, ref) {
  const { header, children, className, ...rest } = props;

  const { CloseIcon } = useIcon();
  const { closeButtonRef, setOpen, setPanelHeaderId } = useSidePanelContext();
  const targetWindow = useWindow();
  const headerId = useId();
  const hasHeader = header != null;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    setPanelHeaderId(hasHeader ? headerId : undefined);
    return () => setPanelHeaderId(undefined);
  }, [hasHeader, headerId, setPanelHeaderId]);

  // Monitor scrollability of the body element
  useEffect(() => {
    const bodyElement = bodyRef.current;
    if (!bodyElement) {
      return;
    }

    const checkScrollable = () => {
      // Element is scrollable if scrollHeight > clientHeight
      setIsScrollable(
        bodyElement.scrollHeight > bodyElement.clientHeight ||
          bodyElement.scrollWidth > bodyElement.clientWidth,
      );
    };

    // Check immediately
    checkScrollable();

    // Use ResizeObserver to detect when content changes or panel resizes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });

    resizeObserver.observe(bodyElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useComponentCssInjection({
    testId: "salt-side-panel-content",
    css: sidePanelContentCss,
    window: targetWindow,
  });

  const ariaLabelledBy =
    rest["aria-labelledby"] ?? (hasHeader ? headerId : undefined);
  const ariaLabel = rest["aria-label"];

  return (
    <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      <div className={withBaseName("header")}>
        {hasHeader ? <div id={headerId}>{header}</div> : null}
        <Button
          ref={closeButtonRef}
          tabIndex={0}
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>
      <div
        ref={bodyRef}
        className={withBaseName("body")}
        role={isScrollable ? "region" : undefined}
        tabIndex={isScrollable ? 0 : undefined}
        {...(isScrollable && {
          "aria-labelledby": ariaLabelledBy || undefined,
          "aria-label": ariaLabel && !ariaLabelledBy ? ariaLabel : undefined,
        })}
      >
        {children}
      </div>
    </div>
  );
});
