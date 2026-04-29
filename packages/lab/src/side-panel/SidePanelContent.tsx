import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import sidePanelContentCss from "./SidePanelContent.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanelContent");

export interface SidePanelContentProps extends ComponentPropsWithRef<"div"> {}

export const SidePanelContent = forwardRef<
  HTMLDivElement,
  SidePanelContentProps
>(function SidePanelContent(props, ref) {
  const { children, className, ...rest } = props;

  const { headerId } = useSidePanelContext();
  const targetWindow = useWindow();
  const contentSuffixId = useId();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

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

    // Use ResizeObserver to detect when the panel resizes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });

    resizeObserver.observe(bodyElement);

    // Use MutationObserver to detect when dynamic content is added/removed,
    // since child size changes don't trigger ResizeObserver on the parent.
    const mutationObserver = new MutationObserver(checkScrollable);
    mutationObserver.observe(bodyElement, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  useComponentCssInjection({
    testId: "salt-side-panel-content",
    css: sidePanelContentCss,
    window: targetWindow,
  });

  const explicitLabelledBy = rest["aria-labelledby"] as string | undefined;
  const explicitLabel = rest["aria-label"] as string | undefined;

  let bodyAriaLabelledBy: string | undefined;
  let bodyAriaLabel: string | undefined;

  if (isScrollable) {
    if (explicitLabelledBy) {
      bodyAriaLabelledBy = explicitLabelledBy;
    } else if (headerId) {
      bodyAriaLabelledBy = `${headerId} ${contentSuffixId}`;
    } else {
      bodyAriaLabel = explicitLabel ?? "Content";
    }
  }

  return (
    <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      <span id={contentSuffixId} className="salt-visuallyHidden">
        content
      </span>
      <div
        ref={bodyRef}
        className={withBaseName("body")}
        {...(isScrollable && {
          role: "region",
          tabIndex: 0,
          "aria-labelledby": bodyAriaLabelledBy,
          "aria-label": bodyAriaLabel,
        })}
      >
        {children}
      </div>
    </div>
  );
});
